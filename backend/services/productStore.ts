import Autobase from "autobase";
import fs from "bare-fs";
import { join } from "bare-path";
import Corestore from "corestore";
import Hyperbee from "hyperbee";
import { resolveStorageRoot } from "../utils/storage.js";

export interface ProductInput {
  id?: string;
  name?: string;
  sku?: string;
  price?: number | string;
  stock?: number | string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ProductRecord {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListInfo {
  baseKey: string;
  discoveryKey: string;
  localWriterKey: string | null;
}

export type ProductOperation =
  | { type: "put"; product: ProductRecord }
  | { type: "patch"; id: string; changes: Partial<ProductRecord> }
  | { type: "delete"; id: string };

interface ViewOptions {
  skipSync?: boolean;
}

const PRODUCT_SCOPE = "mystore/products";
const VIEW_NAME = "products-view";
const NAMESPACE = "mystore-products";
const PRODUCT_PREFIX = "products/";
export const PRODUCT_RANGE = {
  gte: PRODUCT_PREFIX,
  lt: `${PRODUCT_PREFIX}~`,
} as const;

type ProductAutobase = Autobase<ProductOperation & { scope: string }>;

const STORAGE_DIR = join(resolveStorageRoot(), ".mystore", "products");

export async function getProductsView(
  options: ViewOptions = {},
): Promise<Hyperbee> {
  return getView(options);
}

export function normalizeProductShape(
  product: ProductInput = {},
): ProductRecord {
  const now = new Date().toISOString();
  const id =
    typeof product.id === "string" && product.id.trim()
      ? product.id.trim()
      : createProductId();

  const createdAt = toIsoDate(product.createdAt) ?? now;
  const updatedAt = toIsoDate(product.updatedAt) ?? now;

  return {
    id,
    name: normalizeText(product.name, "Untitled Product"),
    sku: normalizeText(product.sku, id.toUpperCase()),
    price: normalizePrice(product.price),
    stock: normalizeStock(product.stock),
    createdAt,
    updatedAt,
  };
}

export const resolveSelectorId = (
  selector?: string | { id?: string } | null,
): string | null => {
  if (typeof selector === "string" && selector.trim()) {
    return selector.trim();
  }

  if (selector && typeof selector === "object" && selector.id) {
    return selector.id;
  }

  return null;
};

export async function appendProductOperation(
  operation: ProductOperation,
): Promise<void> {
  const currentBase = await ensureReady();
  await currentBase.append({ ...operation, scope: PRODUCT_SCOPE });
  await currentBase.update();
}

export async function readProductById(
  id: string,
  options: ViewOptions = {},
): Promise<ProductRecord | null> {
  const bee = await getView(options);
  const entry = await bee.get(productKey(id));
  return entry ? entry.value : null;
}

export async function readFirstProduct(
  options: ViewOptions = {},
): Promise<ProductRecord | null> {
  const bee = await getView(options);
  for await (const entry of bee.createReadStream({
    ...PRODUCT_RANGE,
    limit: 1,
  })) {
    return entry.value;
  }

  return null;
}

export async function seedProduct(
  input: ProductInput = {},
): Promise<ProductRecord> {
  const existing = await readFirstProduct();
  if (existing) {
    return existing;
  }

  const product = normalizeProductShape(input);
  await appendProductOperation({ type: "put", product });
  return (await readProductById(product.id, { skipSync: true })) || product;
}

export async function getProductListInfo(): Promise<ProductListInfo> {
  const currentBase = await ensureReady();
  await currentBase.update();

  const localKey =
    currentBase && currentBase.local && currentBase.local.key
      ? toHexKey(currentBase.local.key)
      : null;

  return {
    baseKey: toHexKey(currentBase.key)!,
    discoveryKey: toHexKey(currentBase.discoveryKey)!,
    localWriterKey: localKey,
  };
}

let teardownRegistered = false;

function ensureTeardownHook(): void {
  if (
    teardownRegistered ||
    typeof Bare === "undefined" ||
    typeof Bare.on !== "function"
  ) {
    return;
  }

  teardownRegistered = true;
  Bare.on("teardown", () => {
    void closeStore();
  });
}

let closing = false;

async function closeStore(): Promise<void> {
  if (closing) {
    return;
  }
  closing = true;

  try {
    if (base) {
      await base.close();
    }
  } catch {
    // Ignore close errors so teardown can continue.
  }

  try {
    if (store) {
      await store.close();
    }
  } catch {
    // Ignore close errors.
  }
}

let store: Corestore | null = null;
let base: ProductAutobase | null = null;
let productsView: Hyperbee | null = null;
let readyPromise: Promise<ProductAutobase> | null = null;

async function ensureReady(): Promise<ProductAutobase> {
  if (!readyPromise) {
    readyPromise = (async () => {
      await fs.promises.mkdir(STORAGE_DIR, { recursive: true });
      store = new Corestore(STORAGE_DIR);
      const namespaced = store.namespace(NAMESPACE);

      base = new Autobase(namespaced, null, {
        valueEncoding: "json",
        open: openProductsView,
        apply: applyProductOperations,
      });

      await base.ready();
      productsView = base.view;
      await productsView!.ready();
      ensureTeardownHook();
      await base.update();

      return base;
    })();
  }

  await readyPromise;
  return base!;
}

function openProductsView(autoStore: any): Hyperbee {
  const core = autoStore.get({ name: VIEW_NAME });
  return new Hyperbee(core, { keyEncoding: "utf-8", valueEncoding: "json" });
}

async function applyProductOperations(
  nodes: { value: ProductOperation & { scope?: string } }[],
  view: Hyperbee,
): Promise<void> {
  if (!nodes.length) {
    return;
  }

  await view.ready();
  const batch = view.batch({ update: false });
  let mutated = false;

  try {
    for (const node of nodes) {
      const op = node.value;
      if (!isProductOperation(op)) {
        continue;
      }

      if (op.type === "put" && op.product) {
        const record = normalizeProductShape(op.product);
        await batch.put(productKey(record.id), record);
        mutated = true;
        continue;
      }

      if (op.type === "patch" && op.id && op.changes) {
        const key = productKey(op.id);
        const current = await view.get(key);
        if (!current) {
          continue;
        }

        const next = normalizeProductShape({
          ...current.value,
          ...op.changes,
          id: op.id,
          createdAt: current.value.createdAt,
          updatedAt: new Date().toISOString(),
        });

        await batch.put(key, next);
        mutated = true;
        continue;
      }

      if (op.type === "delete" && op.id) {
        const key = productKey(op.id);
        const existing = await view.get(key);
        if (!existing) {
          continue;
        }
        await batch.del(key);
        mutated = true;
      }
    }

    if (mutated) {
      await batch.flush();
    }
  } finally {
    await batch.close();
  }
}

function isProductOperation(
  op: { scope?: string } | null | undefined,
): op is ProductOperation & {
  scope?: string | undefined;
} {
  return !!(op && op.scope === PRODUCT_SCOPE);
}

async function getView(options: ViewOptions = {}): Promise<Hyperbee> {
  if (options.skipSync) {
    await ensureReady();
    return productsView!;
  } else {
    const currentBase = await ensureReady();
    await currentBase.update();
    return productsView!;
  }
}

function productKey(id: string): string {
  return `${PRODUCT_PREFIX}${id}`;
}

function createProductId(): string {
  return `product-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const normalizeText = (value: string | undefined, fallback: string): string => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed || fallback;
};

const toIsoDate = (value?: string | number | Date): string | null => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const normalizePrice = (price?: number | string): number => {
  if (typeof price === "number" && Number.isFinite(price)) {
    return Math.max(0, price);
  }

  const parsed = Number(price);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};

const normalizeStock = (stock?: number | string): number => {
  if (typeof stock === "number" && Number.isFinite(stock)) {
    return Math.max(0, Math.trunc(stock));
  }

  const parsed = Number(stock);
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0;
};

const toHexKey = (value?: Uint8Array | BareBuffer | null): string | null => {
  if (!value) {
    return null;
  }

  return Buffer.from(value).toString("hex");
};
