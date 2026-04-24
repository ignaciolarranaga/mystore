import {
  appendProductOperation,
  readProductById,
  type ProductRecord,
} from "./productStore.js";

interface UpdateProductPayload {
  id?: string;
  changes?: Partial<ProductRecord>;
}

export async function updateProductHandler(
  payload: UpdateProductPayload = {},
): Promise<{ payload: { product: ProductRecord } }> {
  const { id, changes } = payload;

  if (!id) {
    throw new Error("Missing product id");
  }

  const current = await readProductById(id);
  if (!current) {
    throw new Error(`Product ${id} not found`);
  }

  if (!changes || !Object.keys(changes).length) {
    return { payload: { product: current } };
  }

  await appendProductOperation({ type: "patch", id, changes });
  const product = await readProductById(id, { skipSync: true });

  if (!product) {
    throw new Error(`Product ${id} not found`);
  }

  return { payload: { product } };
}
