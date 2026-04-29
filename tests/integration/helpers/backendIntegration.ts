import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { vi } from "vitest";

type TeardownHandler = () => void | Promise<void>;

export interface BackendIntegrationHarness {
  storageRoot: string;
  services: {
    createProductHandler: typeof import("../../../backend/services/createProduct").createProductHandler;
    deleteProductHandler: typeof import("../../../backend/services/deleteProduct").deleteProductHandler;
    getProductHandler: typeof import("../../../backend/services/getProduct").getProductHandler;
    listProductsHandler: typeof import("../../../backend/services/listProducts").listProductsHandler;
    seedProduct: typeof import("../../../backend/services/productStore").seedProduct;
    updateProductHandler: typeof import("../../../backend/services/updateProduct").updateProductHandler;
  };
  cleanup: () => Promise<void>;
}

export async function createBackendIntegrationHarness(): Promise<BackendIntegrationHarness> {
  const storageRoot = await mkdtemp(join(tmpdir(), "mystore-integration-"));
  const teardownHandlers = new Set<TeardownHandler>();

  vi.resetModules();
  Object.assign(globalThis, {
    Bare: {
      argv: [storageRoot],
      on(event: "teardown", handler: TeardownHandler) {
        if (event === "teardown") {
          teardownHandlers.add(handler);
        }
      },
    },
  });

  const [
    createProduct,
    deleteProduct,
    getProduct,
    listProducts,
    productStore,
    updateProduct,
  ] = await Promise.all([
    import("../../../backend/services/createProduct"),
    import("../../../backend/services/deleteProduct"),
    import("../../../backend/services/getProduct"),
    import("../../../backend/services/listProducts"),
    import("../../../backend/services/productStore"),
    import("../../../backend/services/updateProduct"),
  ]);

  return {
    storageRoot,
    services: {
      createProductHandler: createProduct.createProductHandler,
      deleteProductHandler: deleteProduct.deleteProductHandler,
      getProductHandler: getProduct.getProductHandler,
      listProductsHandler: listProducts.listProductsHandler,
      seedProduct: productStore.seedProduct,
      updateProductHandler: updateProduct.updateProductHandler,
    },
    async cleanup() {
      await Promise.all(
        Array.from(teardownHandlers, async (handler) => {
          await handler();
        }),
      );
      vi.resetModules();
      delete (globalThis as { Bare?: unknown }).Bare;
      await rm(storageRoot, { recursive: true, force: true });
    },
  };
}

export async function waitForTimestampTick(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 10));
}
