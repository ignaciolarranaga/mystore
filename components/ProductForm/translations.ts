import type { TranslationTable } from "@/utils/i18n";

const translations = {
  es: {
    "Product name": "Nombre del producto",
    SKU: "SKU",
    Price: "Precio",
    Stock: "Stock",
    "Please provide a product name.": "Ingresa un nombre de producto.",
    "Please provide a SKU.": "Ingresa un SKU.",
    "Enter a valid price.": "Ingresa un precio valido.",
    "Enter whole stock.": "Ingresa un stock entero.",
    "Unable to save product right now.":
      "No se puede guardar el producto ahora.",
    Cancel: "Cancelar",
    "Saving...": "Guardando...",
    "Save Product": "Guardar producto",
    "Add Product": "Agregar producto",
  },
} satisfies TranslationTable;

export default translations;
