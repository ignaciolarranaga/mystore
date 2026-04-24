import RPC from "bare-rpc";
import type { Duplex } from "bare-stream";
import { decode, encode } from "./utils/codec.js";

import { COMMANDS, type CommandCode } from "./commands.js";
import { createProductHandler } from "./services/createProduct.js";
import { deleteProductHandler } from "./services/deleteProduct.js";
import { getProductHandler } from "./services/getProduct.js";
import { listProductsHandler } from "./services/listProducts.js";
import { seedProduct } from "./services/productStore.js";
import { updateProductHandler } from "./services/updateProduct.js";

const { IPC } = BareKit as { IPC: Duplex };

type HandlerResponse = { payload?: unknown };
type Handler = (payload?: unknown) => Promise<HandlerResponse | void>;

interface HandlerEntry {
  method: string;
  handler: Handler;
}

const handlers: Partial<Record<CommandCode, HandlerEntry>> = {
  [COMMANDS.CREATE_PRODUCT]: {
    method: "CREATE_PRODUCT",
    handler: createProductHandler as Handler,
  },
  [COMMANDS.GET_PRODUCT]: {
    method: "GET_PRODUCT",
    handler: getProductHandler as Handler,
  },
  [COMMANDS.LIST_PRODUCTS]: {
    method: "LIST_PRODUCTS",
    handler: listProductsHandler as Handler,
  },
  [COMMANDS.UPDATE_PRODUCT]: {
    method: "UPDATE_PRODUCT",
    handler: updateProductHandler as Handler,
  },
  [COMMANDS.DELETE_PRODUCT]: {
    method: "DELETE_PRODUCT",
    handler: deleteProductHandler as Handler,
  },
};

type ResponseStatus = "ok" | "error";

const respond = (
  request: RPC.IncomingRequest,
  {
    method = "UNKNOWN",
    status,
    payload,
    error,
  }: { method?: string; status: ResponseStatus; payload?: unknown; error?: unknown },
): void => {
  request.reply(
    encode({
      type: "RESPONSE",
      method,
      status,
      ...(payload ? { payload } : {}),
      ...(error
        ? {
            error: {
              message: error instanceof Error ? error.message : String(error),
            },
          }
        : {}),
    }),
  );
};

const rpc = new RPC(IPC, async (request: RPC.IncomingRequest) => {
  const entry = handlers[request.command as CommandCode];

  if (!entry) {
    respond(request, {
      method: `UNKNOWN_COMMAND_${request.command}`,
      status: "error",
      error: new Error(`Unsupported command: ${request.command}`),
    });
    return;
  }

  const { handler, method } = entry;
  let payload: unknown;

  try {
    payload = decode(request.data as BareBuffer | null);
  } catch (error) {
    respond(request, { method, status: "error", error });
    return;
  }

  try {
    const result = await handler(payload);
    respond(request, { method, status: "ok", ...(result ?? {}) });
  } catch (error) {
    respond(request, { method, status: "error", error });
  }
});

export default rpc;

try {
  await seedProduct({
    id: "product-demo",
    name: "Demo Coffee Beans",
    sku: "COFFEE-001",
    price: 14.99,
    stock: 24,
  });
} catch (error) {
  console.error("Failed to seed default product", error);
}
