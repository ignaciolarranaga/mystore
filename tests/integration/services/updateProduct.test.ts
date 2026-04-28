import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createBackendIntegrationHarness,
  type BackendIntegrationHarness,
  waitForTimestampTick,
} from "../helpers/backendIntegration";

describe("updateProductHandler integration", () => {
  let harness: BackendIntegrationHarness | undefined;

  beforeEach(async () => {
    harness = await createBackendIntegrationHarness();
  });

  afterEach(async () => {
    await harness?.cleanup();
    harness = undefined;
  });

  it("persists changes while preserving id and createdAt", async () => {
    const { createProductHandler, getProductHandler, updateProductHandler } =
      harness!.services;
    const created = await createProductHandler({
      id: "product-update",
      name: "Original",
      sku: "ORIGINAL",
      price: 10,
      stock: 5,
      createdAt: "2026-02-03T04:05:06.000Z",
      updatedAt: "2026-02-03T04:05:06.000Z",
    });

    await waitForTimestampTick();
    const updated = await updateProductHandler({
      id: "product-update",
      changes: {
        id: "ignored-id",
        name: "Updated",
        price: "14.25" as unknown as number,
        stock: 8,
        createdAt: "2030-01-01T00:00:00.000Z",
      },
    });

    expect(updated.payload.product).toMatchObject({
      id: "product-update",
      name: "Updated",
      sku: "ORIGINAL",
      price: 14.25,
      stock: 8,
      createdAt: created.payload.product.createdAt,
    });
    expect(updated.payload.product.updatedAt).not.toEqual(
      created.payload.product.updatedAt,
    );

    const fetched = await getProductHandler("product-update");
    expect(fetched.payload.product).toEqual(updated.payload.product);
  });

  it("returns the current product when no changes are provided", async () => {
    const { createProductHandler, updateProductHandler } = harness!.services;
    const created = await createProductHandler({ id: "product-no-changes" });

    const updated = await updateProductHandler({
      id: "product-no-changes",
      changes: {},
    });

    expect(updated.payload.product).toEqual(created.payload.product);
  });

  it("throws for missing or nonexistent product ids", async () => {
    const { updateProductHandler } = harness!.services;

    await expect(updateProductHandler()).rejects.toThrow("Missing product id");
    await expect(
      updateProductHandler({
        id: "product-missing",
        changes: { name: "Missing" },
      }),
    ).rejects.toThrow("Product product-missing not found");
  });
});
