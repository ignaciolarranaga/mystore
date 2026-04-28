import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createBackendIntegrationHarness,
  type BackendIntegrationHarness,
} from "../helpers/backendIntegration";

describe("getProductHandler integration", () => {
  let harness: BackendIntegrationHarness | undefined;

  beforeEach(async () => {
    harness = await createBackendIntegrationHarness();
  });

  afterEach(async () => {
    await harness?.cleanup();
    harness = undefined;
  });

  it("returns an existing product by id", async () => {
    const { createProductHandler, getProductHandler } = harness!.services;
    await createProductHandler({
      id: "product-get",
      name: "Get Product",
      sku: "GET-001",
    });

    const result = await getProductHandler({ id: "product-get" });

    expect(result.payload.product).toMatchObject({
      id: "product-get",
      name: "Get Product",
      sku: "GET-001",
    });
  });

  it("returns the first product when no selector is provided", async () => {
    const { createProductHandler, getProductHandler } = harness!.services;
    await createProductHandler({ id: "product-a", name: "Product A" });
    await createProductHandler({ id: "product-b", name: "Product B" });

    const result = await getProductHandler();

    expect(result.payload.product).toMatchObject({
      id: "product-a",
      name: "Product A",
    });
  });

  it("throws when the requested product is missing or deleted", async () => {
    const { createProductHandler, deleteProductHandler, getProductHandler } =
      harness!.services;

    await expect(getProductHandler({ id: "product-missing" })).rejects.toThrow(
      "Product not found",
    );

    await createProductHandler({ id: "product-deleted" });
    await deleteProductHandler({ id: "product-deleted" });

    await expect(getProductHandler("product-deleted")).rejects.toThrow(
      "Product not found",
    );
  });
});
