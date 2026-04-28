import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createBackendIntegrationHarness,
  type BackendIntegrationHarness,
} from "../helpers/backendIntegration";

describe("deleteProductHandler integration", () => {
  let harness: BackendIntegrationHarness | undefined;

  beforeEach(async () => {
    harness = await createBackendIntegrationHarness();
  });

  afterEach(async () => {
    await harness?.cleanup();
    harness = undefined;
  });

  it("removes an existing product from storage and list results", async () => {
    const {
      createProductHandler,
      deleteProductHandler,
      getProductHandler,
      listProductsHandler,
    } = harness!.services;

    await createProductHandler({ id: "product-delete", name: "Delete Me" });
    await createProductHandler({ id: "product-keep", name: "Keep Me" });

    const deleted = await deleteProductHandler({ id: "product-delete" });

    expect(deleted.payload).toEqual({ id: "product-delete" });
    await expect(getProductHandler("product-delete")).rejects.toThrow(
      "Product not found",
    );

    const listed = await listProductsHandler();
    expect(listed.payload.products.map((product) => product.id)).toEqual([
      "product-keep",
    ]);
  });

  it("throws for missing or nonexistent product ids", async () => {
    const { deleteProductHandler } = harness!.services;

    await expect(deleteProductHandler()).rejects.toThrow("Missing product id");
    await expect(
      deleteProductHandler({ id: "product-missing" }),
    ).rejects.toThrow("Product product-missing not found");
  });
});
