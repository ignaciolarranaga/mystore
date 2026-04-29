# E2E Test Instructions

These are user-level end-to-end tests. They exercise the installed mobile app through the UI and verify behavior through observable app state.

## Required Coverage

- Product catalog e2es should keep one happy-path flow that covers create, update, delete, and persistence after app relaunch.
- Prefer stable React Native `testID` selectors over visible text when selecting controls.
- Storage-sensitive behavior must be verified by stopping and relaunching the app without clearing state, then asserting the catalog reloads the expected backend state.
- Use unique `E2E-*` SKUs and names so tests do not collide with seeded demo data.

## Generated Artifacts

- Do not edit `backend/dist/**` directly.
- Do not edit `app/app.bundle.mjs` directly.
- If backend source changes are needed for an e2e, regenerate the backend bundle through the project script.
