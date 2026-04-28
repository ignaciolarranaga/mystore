# ITD 6: Treat backend bundles as generated artifacts

## The Problem

How should the repository handle compiled backend output used by the React Native app?

## Options Considered

1. Edit bundled backend files directly when behavior changes
2. Commit backend source only and never keep a generated app bundle
3. **Treat backend bundles as generated artifacts**

## Rationale

Backend behavior should be changed in source files under `backend/**`, then regenerated through the backend bundle script. This keeps source code as the maintainable authority while still producing the bundle required by the React Native app runtime.

## Notes

Do not edit `backend/dist/**` or `app/app.bundle.mjs` directly. If backend source changes, run `npm run backend:bundle`.
