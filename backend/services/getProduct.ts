import {
  readFirstProduct,
  readProductById,
  resolveSelectorId,
  type ProductRecord,
} from "./productStore.js";

export async function getProductHandler(
  payload?: string | { id?: string } | null,
): Promise<{ payload: { product: ProductRecord } }> {
  const id = resolveSelectorId(payload ?? undefined);
  const product = id ? await readProductById(id) : await readFirstProduct();

  if (!product) {
    throw new Error("Product not found");
  }

  return { payload: { product } };
}
