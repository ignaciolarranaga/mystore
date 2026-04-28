import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createBackendIntegrationHarness,
  type BackendIntegrationHarness,
} from "../helpers/backendIntegration";

describe("listProductsHandler integration", () => {
  let harness: BackendIntegrationHarness | undefined;

  beforeEach(async () => {
    harness = await createBackendIntegrationHarness();
  });

  afterEach(async () => {
    await harness?.cleanup();
    harness = undefined;
  });

  it("returns created products in reverse product-key order", async () => {
    const { createProductHandler, listProductsHandler } = harness!.services;
    await createProductHandler({ id: "product-a", name: "Product A" });
    await createProductHandler({ id: "product-c", name: "Product C" });
    await createProductHandler({ id: "product-b", name: "Product B" });

    const result = await listProductsHandler();

    expect(result.payload.products.map((product) => product.id)).toEqual([
      "product-c",
      "product-b",
      "product-a",
    ]);
  });

  it("reflects updates and deletes in storage", async () => {
    const {
      createProductHandler,
      deleteProductHandler,
      listProductsHandler,
      updateProductHandler,
    } = harness!.services;

    await createProductHandler({ id: "product-list-a", name: "Product A" });
    await createProductHandler({ id: "product-list-b", name: "Product B" });
    await updateProductHandler({
      id: "product-list-a",
      changes: { name: "Updated Product A", stock: 22 },
    });
    await deleteProductHandler({ id: "product-list-b" });

    const result = await listProductsHandler();

    expect(result.payload.products).toHaveLength(1);
    expect(result.payload.products[0]).toMatchObject({
      id: "product-list-a",
      name: "Updated Product A",
      stock: 22,
    });
  });
});
