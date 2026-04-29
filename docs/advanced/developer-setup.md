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

## Run E2E Tests

The end-to-end suite uses Maestro and lives under `tests/e2e`. Install Maestro locally before running the suite:

```sh
curl -Ls "https://get.maestro.mobile.dev" | bash
```

Run the iOS suite against a booted simulator:

```sh
npm run test:e2e:ios:all
```

Run the Android suite against a running emulator:

```sh
npm run test:e2e:android:all
```

The `:all` scripts install release-style app builds with the JavaScript bundle embedded, so the e2e run does not require a separate Metro server. The e2e flow verifies the critical product journey: initial catalog load, create, update, delete, and persistence after app relaunch through the real mobile UI and Bare backend.

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
