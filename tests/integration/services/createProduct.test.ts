import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createBackendIntegrationHarness,
  type BackendIntegrationHarness,
} from "../helpers/backendIntegration";

describe("createProductHandler integration", () => {
  let harness: BackendIntegrationHarness | undefined;

  beforeEach(async () => {
    harness = await createBackendIntegrationHarness();
  });

  afterEach(async () => {
    await harness?.cleanup();
    harness = undefined;
  });

  it("persists a created product so it can be fetched by id", async () => {
    const { createProductHandler, getProductHandler } = harness!.services;

    const created = await createProductHandler({
      product: {
        id: "product-create",
        name: "  Test Coffee  ",
        sku: "  COFFEE-TEST  ",
        price: "12.50",
        stock: "7",
        createdAt: "2026-01-02T03:04:05.000Z",
        updatedAt: "2026-01-02T03:04:05.000Z",
      },
    });

    expect(created.payload.product).toMatchObject({
      id: "product-create",
      name: "Test Coffee",
      sku: "COFFEE-TEST",
      price: 12.5,
      stock: 7,
      createdAt: "2026-01-02T03:04:05.000Z",
      updatedAt: "2026-01-02T03:04:05.000Z",
    });

    const fetched = await getProductHandler({ id: "product-create" });
    expect(fetched.payload.product).toEqual(created.payload.product);
  });

  it("normalizes default and invalid product fields before storing", async () => {
    const { createProductHandler, getProductHandler } = harness!.services;

    const created = await createProductHandler({
      id: "  product-normalized  ",
      name: "   ",
      sku: "   ",
      price: -10,
      stock: 4.8,
      createdAt: "not-a-date",
      updatedAt: "not-a-date",
    });

    expect(created.payload.product).toMatchObject({
      id: "product-normalized",
      name: "Untitled Product",
      sku: "PRODUCT-NORMALIZED",
      price: 0,
      stock: 4,
    });
    expect(created.payload.product.createdAt).toEqual(
      created.payload.product.updatedAt,
    );

    const fetched = await getProductHandler("product-normalized");
    expect(fetched.payload.product).toEqual(created.payload.product);
  });
});
