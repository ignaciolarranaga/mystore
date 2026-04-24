import "../global.css";

import RPC from "bare-rpc";
import { Paths } from "expo-file-system";
import type { Duplex } from "bare-stream";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, ListRenderItem, Text, View } from "react-native";
import { Worklet } from "react-native-bare-kit";

import { COMMANDS } from "@/backend/commands";
import ProductForm, { type ProductFormValues } from "@/components/ProductForm";
import ProductItem from "@/components/ProductItem";
import { ProductItem as Item } from "@/model/ProductItem";
import { I18nProvider, useTranslate } from "@/utils/i18n";
import bundle from "./app.bundle.mjs";
import translations from "./translations";

type BackendProduct = Omit<Item, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

type BackendMessage =
  | {
      type: "RESPONSE";
      status: "ok";
      method: string;
      payload?: {
        product?: BackendProduct;
        products?: BackendProduct[];
        id?: string;
      };
    }
  | {
      type: "RESPONSE";
      status: "error";
      method: string;
      error?: {
        message?: string;
      };
    };

const toProductItem = (product: BackendProduct): Item => {
  const { createdAt, updatedAt, ...rest } = product;

  return {
    ...(rest as Omit<BackendProduct, "createdAt" | "updatedAt">),
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
  };
};

const BACKEND_FILENAME = "/app.bundle";
const BACKEND_STORAGE_ROOT = Paths.document.uri;

const parseBackendMessage = (response: unknown): BackendMessage => {
  if (typeof response !== "string") {
    throw new Error("Unexpected backend response");
  }

  return JSON.parse(response) as BackendMessage;
};

function StoreCatalogScreen() {
  const t = useTranslate(translations);
  const [products, setProducts] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingUpdateId, setPendingUpdateId] = useState<string | null>(null);

  const rpcRef = useRef<RPC | null>(null);
  const isMountedRef = useRef(true);

  const fetchProducts = useCallback(async () => {
    const rpc = rpcRef.current;
    if (!rpc) {
      throw new Error(t("Backend not ready"));
    }

    const request = rpc.request(COMMANDS.LIST_PRODUCTS);
    request.send();

    const response = await request.reply("utf8");
    const message = parseBackendMessage(response);
    if (message.type !== "RESPONSE") {
      throw new Error(t("Unexpected backend response"));
    }

    if (message.status === "ok") {
      const list = message.payload?.products ?? [];
      setProducts(list.map(toProductItem));
      setError(null);
      return;
    }

    throw new Error(message.error?.message ?? t("Backend error"));
  }, [t]);

  useEffect(() => {
    const worklet = new Worklet();
    worklet.start(BACKEND_FILENAME, bundle, [BACKEND_STORAGE_ROOT]);

    const rpc = new RPC(worklet.IPC as unknown as Duplex, () => {});
    rpcRef.current = rpc;
    isMountedRef.current = true;

    const load = async () => {
      setLoading(true);
      try {
        await fetchProducts();
      } catch (backendError) {
        if (!isMountedRef.current) {
          return;
        }
        setError(
          backendError instanceof Error
            ? backendError.message
            : t("Failed to read backend response"),
        );
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMountedRef.current = false;
      rpcRef.current = null;
      worklet.terminate();
    };
  }, [fetchProducts, t]);

  const handleCreateProduct = useCallback(
    async (input: ProductFormValues) => {
      if (!rpcRef.current) {
        throw new Error(t("Backend not ready yet."));
      }

      const request = rpcRef.current.request(COMMANDS.CREATE_PRODUCT);
      request.send(
        JSON.stringify({
          product: {
            name: input.name,
            sku: input.sku,
            price: input.price,
            stock: input.stock,
          },
        }),
      );

      const response = await request.reply("utf8");
      const message = parseBackendMessage(response);
      if (message.type !== "RESPONSE") {
        throw new Error(t("Unexpected backend response"));
      }

      if (message.status === "error") {
        throw new Error(
          message.error?.message ?? t("Failed to create product"),
        );
      }

      await fetchProducts();
    },
    [fetchProducts, t],
  );

  const handleUpdateProduct = useCallback(
    async (productId: string, input: ProductFormValues) => {
      if (!rpcRef.current) {
        throw new Error(t("Backend not ready yet."));
      }

      setPendingUpdateId(productId);
      try {
        const request = rpcRef.current.request(COMMANDS.UPDATE_PRODUCT);
        request.send(
          JSON.stringify({
            id: productId,
            changes: {
              name: input.name,
              sku: input.sku,
              price: input.price,
              stock: input.stock,
            },
          }),
        );

        const response = await request.reply("utf8");
        const message = parseBackendMessage(response);
        if (message.type !== "RESPONSE") {
          throw new Error(t("Unexpected backend response"));
        }

        if (message.status === "error") {
          throw new Error(
            message.error?.message ?? t("Failed to update product"),
          );
        }

        await fetchProducts();
      } catch (updateError) {
        setError(
          updateError instanceof Error
            ? updateError.message
            : t("Unable to update product right now."),
        );
        throw updateError;
      } finally {
        setPendingUpdateId(null);
      }
    },
    [fetchProducts, t],
  );

  const handleDeleteProduct = useCallback(
    async (productId?: string) => {
      if (!productId || !rpcRef.current) {
        return;
      }

      setPendingDeleteId(productId);
      try {
        const request = rpcRef.current.request(COMMANDS.DELETE_PRODUCT);
        request.send(
          JSON.stringify({
            id: productId,
          }),
        );

        const response = await request.reply("utf8");
        const message = parseBackendMessage(response);
        if (message.type !== "RESPONSE") {
          throw new Error(t("Unexpected backend response"));
        }

        if (message.status === "error") {
          throw new Error(
            message.error?.message ?? t("Failed to delete product"),
          );
        }

        await fetchProducts();
      } catch (deleteError) {
        setError(
          deleteError instanceof Error
            ? deleteError.message
            : t("Unable to delete product right now."),
        );
      } finally {
        setPendingDeleteId(null);
      }
    },
    [fetchProducts, t],
  );

  const renderProductItem = useCallback<ListRenderItem<Item>>(
    ({ item }) => (
      <View className="w-full">
        <ProductItem
          item={item}
          onDelete={handleDeleteProduct}
          onUpdate={handleUpdateProduct}
          deleting={pendingDeleteId === item.id}
          updating={pendingUpdateId === item.id}
        />
      </View>
    ),
    [
      handleDeleteProduct,
      handleUpdateProduct,
      pendingDeleteId,
      pendingUpdateId,
    ],
  );

  const keyExtractor = useCallback(
    (item: Item, index: number) => item.id ?? `${item.sku}-${index}`,
    [],
  );

  const hasVisibleProducts = !loading && !error && products.length > 0;

  const listHeader = (
    <View className="w-full items-center">
      <Text className="text-xl font-bold text-slate-900">
        {t("Store Catalog")}
      </Text>
      {loading ? (
        <Text className="mt-4 text-base text-slate-500">
          {t("Loading products from the Bare backend...")}
        </Text>
      ) : error ? (
        <Text className="mt-4 text-base text-red-500">
          {t("Backend error: {message}", { message: error })}
        </Text>
      ) : null}
      <View className="mt-5 w-full max-w-[460px]">
        <ProductForm disabled={loading} onSubmit={handleCreateProduct} />
      </View>
      {hasVisibleProducts ? <View className="mt-4 w-full" /> : null}
    </View>
  );

  const listEmptyComponent =
    !loading && !error ? (
      <View className="w-full">
        <Text className="mt-4 text-base text-slate-500">
          {t("No products available yet.")}
        </Text>
      </View>
    ) : null;

  const visibleProducts = !loading && !error ? products : [];

  return (
    <View className="flex-1 bg-slate-50">
      <FlatList
        data={visibleProducts}
        keyExtractor={keyExtractor}
        renderItem={renderProductItem}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 80,
          paddingBottom: 48,
        }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmptyComponent}
      />
    </View>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <StoreCatalogScreen />
    </I18nProvider>
  );
}
