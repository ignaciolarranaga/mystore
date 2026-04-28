# ITD 5: Use app-owned storage paths passed from React Native to Bare

## The Problem

Which filesystem location should the Bare backend use for product storage on mobile devices?

## Options Considered

1. Let the backend fall back to platform paths such as `/data`
2. Use a temporary directory as the primary storage location
3. **Use app-owned storage paths passed from React Native to Bare**

## Rationale

The backend must write inside storage owned by the mobile app. Passing the Expo document storage URI from React Native gives the Bare backend a safe writable root and avoids unsafe Android paths such as `/data`.

## Notes

The React Native app passes `Paths.document.uri` when starting the worklet, and the backend resolves it before creating the product storage directories.
