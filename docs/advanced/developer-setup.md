# Developer Setup

This page is for developers who want to build mystore from source. Typical users should install the published app once store releases are available.

## Prerequisites

Install the project dependencies before running the app:

```sh
npm install
```

## Bundle the Backend

The Bare backend source is bundled into `app/app.bundle.mjs` for the React Native app:

```sh
npm run backend:bundle
```

`backend/dist/**` and `app/app.bundle.mjs` are generated artifacts. Do not edit them directly.

## Run on iOS

```sh
npm run ios
```

## Run on Android

```sh
npm run android
```

If Android fails with a `uses-sdk:minSdkVersion` error, reapply the local patch and retry from a clean native build:

```sh
npm run android:fix
rm -rf android/app/build android/.gradle .expo .expo-shared
npx expo run:android
```

## Watch Backend Changes

During backend development, use:

```sh
npm run watch:backend
```

## Read Bare Logs on macOS

```sh
log stream --level=debug --predicate "subsystem == 'bare'"
```

## Preview This Documentation

The documentation lives in `docs/` and is designed for GitHub Pages. To preview it locally:

```sh
npx docsify-cli serve docs
```
