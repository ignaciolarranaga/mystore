import {
  appendProductOperation,
  normalizeProductShape,
  readProductById,
  type ProductInput,
  type ProductRecord,
} from "./productStore.js";

type CreateProductPayload = ProductInput | { product?: ProductInput };

const DEFAULT_PRODUCT = Object.freeze({
  name: "Sample Product",
  sku: "SAMPLE-001",
  price: 19.99,
  stock: 12,
}) satisfies Required<Omit<ProductInput, "id" | "createdAt" | "updatedAt">>;

function createProductRecord(input: ProductInput = {}): ProductRecord {
  const record: ProductInput = {
    id:
      typeof input.id === "string" && input.id.trim()
        ? input.id.trim()
        : undefined,
    name: input.name ?? DEFAULT_PRODUCT.name,
    sku: input.sku ?? DEFAULT_PRODUCT.sku,
    price: input.price ?? DEFAULT_PRODUCT.price,
    stock: input.stock ?? DEFAULT_PRODUCT.stock,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };

  return normalizeProductShape(record);
}

export async function createProductHandler(
  payload: CreateProductPayload = {},
): Promise<{ payload: { product: ProductRecord } }> {
  const productInput: ProductInput =
    (typeof payload === "object" &&
      payload !== null &&
      "product" in payload &&
      payload.product) ||
    (payload as ProductInput);
  const product = createProductRecord(productInput);
  await appendProductOperation({ type: "put", product });
  const stored = await readProductById(product.id, { skipSync: true });

  return { payload: { product: stored || product } };
}
