import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createBackendIntegrationHarness,
  type BackendIntegrationHarness,
} from "../helpers/backendIntegration";

describe("seedProduct integration", () => {
  let harness: BackendIntegrationHarness | undefined;

  beforeEach(async () => {
    harness = await createBackendIntegrationHarness();
  });

  afterEach(async () => {
    await harness?.cleanup();
    harness = undefined;
  });

  it("persists a default product before list reads the catalog", async () => {
    const { listProductsHandler, seedProduct } = harness!.services;

    await seedProduct({
      id: "product-demo",
      name: "Demo Coffee Beans",
      sku: "COFFEE-001",
      price: 14.99,
      stock: 24,
    });

    const result = await listProductsHandler();

    expect(result.payload.products).toHaveLength(1);
    expect(result.payload.products[0]).toMatchObject({
      id: "product-demo",
      name: "Demo Coffee Beans",
      sku: "COFFEE-001",
      price: 14.99,
      stock: 24,
    });
  });
});
