# ITD 2: Use a Bare worklet backend for local product data operations

## The Problem

Where should product data operations run so the app can keep local product storage logic separate from the React Native UI?

## Options Considered

1. Run all product data logic directly in React Native components
2. Use a remote server API for product operations
3. **Use a Bare worklet backend for local product data operations**

## Rationale

A Bare worklet backend isolates product command handling and persistence from the UI while keeping the product catalog local to the mobile app. This keeps the React Native side focused on interaction and rendering, and the Bare side focused on storage and command execution.

## Notes

The React Native app starts the worklet with `react-native-bare-kit` and loads the bundled backend from `app/app.bundle.mjs`.
