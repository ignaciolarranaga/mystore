import { appendProductOperation, readProductById } from "./productStore.js";

interface DeleteProductPayload {
  id?: string;
}

export async function deleteProductHandler(
  payload: DeleteProductPayload = {},
): Promise<{ payload: { id: string } }> {
  const { id } = payload;

  if (!id) {
    throw new Error("Missing product id");
  }

  const existing = await readProductById(id);
  if (!existing) {
    throw new Error(`Product ${id} not found`);
  }

  await appendProductOperation({ type: "delete", id });

  return { payload: { id } };
}
