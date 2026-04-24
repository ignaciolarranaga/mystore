import type { TranslationTable } from "@/utils/i18n";

const translations = {
  es: {
    "Store Catalog": "Catalogo de la tienda",
    "Loading products from the Bare backend...":
      "Cargando productos desde el backend Bare...",
    "Backend error: {message}": "Error del backend: {message}",
    "No products available yet.": "Todavía no hay productos disponibles.",
    "Backend not ready": "El backend no esta listo",
    "Backend not ready yet.": "El backend todavía no esta listo.",
    "Unexpected backend response": "Respuesta inesperada del backend",
    "Backend error": "Error del backend",
    "Failed to read backend response":
      "No se pudo leer la respuesta del backend",
    "Failed to create product": "No se pudo crear el producto",
    "Failed to update product": "No se pudo actualizar el producto",
    "Failed to delete product": "No se pudo eliminar el producto",
    "Unable to update product right now.":
      "No se puede actualizar el producto ahora.",
    "Unable to delete product right now.":
      "No se puede eliminar el producto ahora.",
  },
} satisfies TranslationTable;

export default translations;
