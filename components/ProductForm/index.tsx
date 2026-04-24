import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, TextInput, View } from "react-native";

export interface ProductFormValues {
  name: string;
  sku: string;
  price: number;
  stock: number;
}

interface ProductFormFields {
  name: string;
  sku: string;
  price: string;
  stock: string;
}

interface ProductFormProps {
  disabled?: boolean;
  initialValues?: Partial<ProductFormValues>;
  mode?: "create" | "edit";
  onCancel?: () => void;
  onSubmit: (values: ProductFormValues) => Promise<void>;
}

export default function ProductForm({
  disabled = false,
  initialValues,
  mode = "create",
  onCancel,
  onSubmit,
}: ProductFormProps) {
  const defaultValues = useMemo<ProductFormFields>(
    () => ({
      name: initialValues?.name ?? "",
      sku: initialValues?.sku ?? "",
      price:
        typeof initialValues?.price === "number"
          ? String(initialValues.price)
          : "",
      stock:
        typeof initialValues?.stock === "number"
          ? String(initialValues.stock)
          : "",
    }),
    [initialValues],
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormFields>({
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onFormSubmit = useCallback(
    async ({ name, sku, price, stock }: ProductFormFields) => {
      const trimmedName = name.trim();
      const normalizedSku = sku.trim().toUpperCase();
      const numericPrice = Number(price.trim());
      const numericStock = Number(stock.trim());

      if (
        !trimmedName ||
        !normalizedSku ||
        Number.isNaN(numericPrice) ||
        !Number.isInteger(numericStock)
      ) {
        return;
      }

      setSubmissionError(null);

      try {
        await onSubmit({
          name: trimmedName,
          sku: normalizedSku,
          price: numericPrice,
          stock: numericStock,
        });

        if (mode === "create") {
          reset();
        }
      } catch (submitError) {
        setSubmissionError(
          submitError instanceof Error
            ? submitError.message
            : "Unable to save product right now.",
        );
      }
    },
    [mode, onSubmit, reset],
  );

  const submitForm = useMemo(
    () => handleSubmit(onFormSubmit),
    [handleSubmit, onFormSubmit],
  );

  const watchedName = watch("name") ?? "";
  const watchedSku = watch("sku") ?? "";
  const watchedPrice = watch("price") ?? "";
  const watchedStock = watch("stock") ?? "";
  const submitDisabled =
    disabled ||
    isSubmitting ||
    !watchedName.trim() ||
    !watchedSku.trim() ||
    !watchedPrice.trim() ||
    !watchedStock.trim();

  return (
    <View className="w-full">
      <View className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-800/10">
        <Controller
          control={control}
          name="name"
          rules={{
            validate: (value) =>
              value.trim() ? true : "Please provide a product name.",
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Product name"
              placeholderTextColor="#94a3b8"
              className="rounded-md border border-slate-200 bg-white px-3 py-3 text-base"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
            />
          )}
        />
        {errors.name ? (
          <Text className="mt-1 text-sm text-red-500">
            {errors.name.message}
          </Text>
        ) : null}

        <Controller
          control={control}
          name="sku"
          rules={{
            validate: (value) =>
              value.trim() ? true : "Please provide a SKU.",
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="SKU"
              placeholderTextColor="#94a3b8"
              className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-3 text-base"
              value={value}
              onChangeText={(val) => onChange(val.toUpperCase())}
              onBlur={onBlur}
              autoCapitalize="characters"
            />
          )}
        />
        {errors.sku ? (
          <Text className="mt-1 text-sm text-red-500">
            {errors.sku.message}
          </Text>
        ) : null}

        <View className="mt-3 flex-row gap-3">
          <View className="flex-1">
            <Controller
              control={control}
              name="price"
              rules={{
                validate: (value) => {
                  const parsed = Number(value.trim());
                  if (!value.trim() || Number.isNaN(parsed) || parsed < 0) {
                    return "Enter a valid price.";
                  }
                  return true;
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Price"
                  placeholderTextColor="#94a3b8"
                  className="rounded-md border border-slate-200 bg-white px-3 py-3 text-base"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="decimal-pad"
                />
              )}
            />
            {errors.price ? (
              <Text className="mt-1 text-sm text-red-500">
                {errors.price.message}
              </Text>
            ) : null}
          </View>

          <View className="flex-1">
            <Controller
              control={control}
              name="stock"
              rules={{
                validate: (value) => {
                  const parsed = Number(value.trim());
                  if (
                    !value.trim() ||
                    Number.isNaN(parsed) ||
                    !Number.isInteger(parsed) ||
                    parsed < 0
                  ) {
                    return "Enter whole stock.";
                  }
                  return true;
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Stock"
                  placeholderTextColor="#94a3b8"
                  className="rounded-md border border-slate-200 bg-white px-3 py-3 text-base"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="number-pad"
                />
              )}
            />
            {errors.stock ? (
              <Text className="mt-1 text-sm text-red-500">
                {errors.stock.message}
              </Text>
            ) : null}
          </View>
        </View>

        {submissionError ? (
          <Text className="mt-3 text-sm text-red-500">{submissionError}</Text>
        ) : null}

        <View className="mt-4 flex-row gap-3">
          {mode === "edit" && onCancel ? (
            <Pressable
              className="flex-1 rounded-md border border-slate-300 px-4 py-3"
              disabled={disabled || isSubmitting}
              onPress={onCancel}
            >
              <Text className="text-center text-base font-semibold text-slate-700">
                Cancel
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            className={`rounded-md px-4 py-3 ${
              mode === "edit" && onCancel ? "flex-1" : "w-full"
            } ${submitDisabled ? "bg-slate-300" : "bg-blue-600"}`}
            disabled={submitDisabled}
            onPress={submitForm}
          >
            <Text className="text-center text-base font-semibold text-white">
              {isSubmitting
                ? "Saving..."
                : mode === "edit"
                  ? "Save Product"
                  : "Add Product"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
