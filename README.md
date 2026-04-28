# mystore

Minimal React Native store catalog app with an Expo frontend and a Bare backend. Product records are projected into Hyperbee through Autobase/Corestore and accessed from the app through `bare-rpc`.

## Documentation

Product documentation lives under `docs/` and is designed to be published with GitHub Pages from the `main` branch `/docs` folder.

To preview the documentation locally, run:

```sh
npx docsify-cli serve docs
```

After GitHub Pages is enabled for the repository, add the published Pages URL or custom domain here.

## Get started

1. Install dependencies: `npm install`
2. Bundle the backend: `npm run backend:bundle`
3. Start the app in iOS: `npm run ios`

The first screen opens to the product catalog. You can create, edit, and delete products with `name`, `sku`, `price`, and `stock` fields.

## Fixing `npm run android`

If the Android build fails with a `uses-sdk:minSdkVersion` error (e.g. after installing `react-native-bare-kit`), run:

1. Run `npm run android:fix` (after `npm install` if needed) to reapply the `patch-package` fix that aligns `react-native-bare-kit` with the app's `minSdkVersion`.
2. Clear previous Android outputs: `rm -rf android/app/build android/.gradle .expo .expo-shared`.
3. Retry `npx expo run:android` (or `npm run android`) to rebuild from a clean slate.

## Hints

- Starting watching changes on the backend: `npm run watch:backend`
- Getting the Log on Mac: `log stream --level=debug --predicate "subsystem == 'bare'"`
