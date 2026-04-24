# AGENTS.md

## Project Context

This app is an Expo React Native product catalog with a Bare worklet backend. The frontend talks to the backend through `bare-rpc`; product data is stored in Corestore/Autobase/Hyperbee from the Bare runtime.

## Repo-Specific Guidance

- Treat `backend/dist/**` and `app/app.bundle.mjs` as generated artifacts. Do not edit them directly. If backend source under `backend/**` changes, regenerate the backend bundle so the React Native app runs the updated worklet code.
- The Bare backend must use an app-owned storage path passed from the React Native side. Avoid falling back to Android paths such as `/data`; those are not safe writable app storage.
- Keep UI translations colocated with the screen/component that owns the copy, using the English source text as the translation key. Shared i18n helpers live in `utils/i18n.tsx`.
- Keep `AGENTS.md` as the canonical AI-assistant instruction file. Other assistant-specific files should point here instead of duplicating rules.

## Android Pitfalls

- `react-native-bare-kit` still needs the local `patch-package` patch for Android `minSdkVersion` alignment. Preserve the patch unless upstream changes make it unnecessary and the Android build is verified.
