# ITD 4: Use Corestore, Autobase, and Hyperbee for product persistence

## The Problem

How should mystore persist product records in the Bare backend?

## Options Considered

1. Store products in plain JSON files
2. Use SQLite from the mobile app
3. **Use Corestore, Autobase, and Hyperbee for product persistence**

## Rationale

Corestore, Autobase, and Hyperbee provide an append-and-project model that fits product operations well: writes are captured as operations, and reads use a projected key-value view. This keeps mutation history and current product lookup concerns separated inside the backend.

## Notes

Product records are projected under the `products/` key prefix in Hyperbee.
