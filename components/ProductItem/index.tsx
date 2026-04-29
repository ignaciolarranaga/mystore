import { ProductItem as Item } from "@/model/ProductItem";
import {
  type Language,
  localeTagForLanguage,
  useAppLanguage,
  useTranslate,
} from "@/utils/i18n";
import { useCallback, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import ProductForm, { type ProductFormValues } from "../ProductForm";
import translations from "./translations";

interface ProductItemProps {
  item: Item;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, values: ProductFormValues) => Promise<void>;
  deleting?: boolean;
  updating?: boolean;
}

export default function ProductItem({
  item,
  onDelete,
  onUpdate,
  deleting = false,
  updating = false,
}: ProductItemProps) {
  const [editing, setEditing] = useState(false);
  const language = useAppLanguage();
  const t = useTranslate(translations);
  const formattedPrice = useMemo(
    () => formatPrice(item.price, language),
    [item.price, language],
  );
  const canDelete = Boolean(onDelete && item.id);
  const canEdit = Boolean(onUpdate && item.id);
  const testIdPrefix = `product-item.${item.sku}`;

  const handleDelete = useCallback(() => {
    if (!canDelete || !item.id || !onDelete) {
      return;
    }

    onDelete(item.id);
  }, [canDelete, item.id, onDelete]);

  const handleUpdate = useCallback(
    async (values: ProductFormValues) => {
      if (!canEdit || !item.id || !onUpdate) {
        return;
      }

      await onUpdate(item.id, values);
      setEditing(false);
    },
    [canEdit, item.id, onUpdate],
  );

  if (editing) {
    return (
      <View
        className="mb-3 rounded-lg border border-blue-100 bg-white p-3 shadow-sm"
        testID={`${testIdPrefix}.editing`}
      >
        <ProductForm
          mode="edit"
          disabled={updating}
          initialValues={item}
          onCancel={() => setEditing(false)}
          onSubmit={handleUpdate}
        />
      </View>
    );
  }

  return (
    <View
      className="mb-3 rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      testID={testIdPrefix}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-base font-semibold text-slate-900 dark:text-white">
            {item.name}
          </Text>
          <Text className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-300">
            {item.sku}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-base font-bold text-emerald-600 dark:text-emerald-400">
            {formattedPrice}
          </Text>
          <Text className="mt-1 text-sm text-slate-500 dark:text-slate-300">
            {t("{count} in stock", { count: item.stock })}
          </Text>
        </View>
      </View>

      <View className="mt-3 flex-row gap-2">
        {canEdit ? (
          <Pressable
            className="rounded-md bg-blue-50 px-3 py-2 dark:bg-blue-500/20"
            onPress={() => setEditing(true)}
            disabled={deleting || updating}
            accessibilityRole="button"
            testID={`${testIdPrefix}.edit`}
          >
            <Text className="text-xs font-semibold text-blue-600 dark:text-blue-200">
              {t("Edit")}
            </Text>
          </Pressable>
        ) : null}
        {canDelete ? (
          <Pressable
            className={`rounded-md px-3 py-2 ${
              deleting ? "bg-slate-200" : "bg-red-50 dark:bg-red-500/20"
            }`}
            onPress={handleDelete}
            disabled={deleting || updating}
            accessibilityRole="button"
            testID={`${testIdPrefix}.delete`}
          >
            <Text
              className={`text-xs font-semibold ${
                deleting
                  ? "text-slate-500 dark:text-slate-300"
                  : "text-red-500 dark:text-red-300"
              }`}
            >
              {deleting ? t("Deleting...") : t("Delete")}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const formatPrice = (price: number, language: Language) => {
  try {
    return new Intl.NumberFormat(localeTagForLanguage(language), {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `$${price.toFixed(2)}`;
  }
};
