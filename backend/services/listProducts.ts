import {
  getProductsView,
  PRODUCT_RANGE,
  type ProductRecord,
} from "./productStore.js";

export async function listProductsHandler(): Promise<{
  payload: { products: ProductRecord[] };
}> {
  const bee = await getProductsView();
  const products: ProductRecord[] = [];

  for await (const entry of bee.createReadStream({
    ...PRODUCT_RANGE,
    reverse: true,
  })) {
    products.push(entry.value as ProductRecord);
  }

  return { payload: { products } };
}
