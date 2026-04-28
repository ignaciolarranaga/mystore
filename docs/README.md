# mystore

mystore is a mobile product catalog for managing store inventory from an Expo React Native app. It gives users a simple catalog workflow for creating, viewing, editing, and deleting products with the product details that matter for day-to-day inventory tracking.

The app is intentionally small and focused. It is designed around local product data operations, with the user interface running in React Native and product storage handled by a Bare worklet backend.

## Who It Is For

mystore is for people who need a lightweight product catalog they can operate from a mobile device. The current product model covers the essentials:

- Product name
- SKU
- Price
- Stock quantity

## Core Workflow

1. Open the app to the store catalog.
2. Add a product with its name, SKU, price, and stock.
3. Review the product list.
4. Update product details when inventory or pricing changes.
5. Delete products that are no longer needed.

## Documentation Map

- [Features](/features.md) describes the current user-facing capabilities.
- [Getting Started](/getting-started.md) explains how users will install and start using the app.
- [Developer Setup](/advanced/developer-setup.md) explains how developers can build the app from source.
- [Architecture](/advanced/architecture.md) explains the system using C4 diagrams.
- [Technical Decisions](/advanced/technical-decisions.md) captures the important technical choices behind the product.
