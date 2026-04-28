# Features

## Product Catalog

mystore opens directly to the product catalog. The catalog shows products loaded from the Bare backend and keeps the user focused on the inventory workflow.

## Create Products

Users can create products with:

- Name
- SKU
- Price
- Stock quantity

The backend normalizes product data and stores product records with creation and update timestamps.

## List Products

The app loads products through the backend and displays them in the catalog. A demo product is seeded when the product store is empty so the app has useful initial data.

## Update Products

Users can edit existing product details. Updates are sent to the backend as product changes and the catalog refreshes after the update completes.

## Delete Products

Users can delete products from the catalog. Deletion is handled through the backend and the visible list refreshes after the operation completes.

## Local Backend Storage

Product data is handled by a Bare worklet backend running with an app-owned storage path provided by the React Native app. This keeps backend storage inside writable app storage instead of relying on unsafe platform paths.

## Mobile App Foundation

The app is built with Expo React Native and supports iOS and Android development flows. The backend bundle is regenerated before native app runs so the mobile app uses the current Bare worklet code.
