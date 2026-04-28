# Technical Decisions

mystore uses Important Technical Decisions (ITDs) to capture technical choices in a lightweight, reviewable format.

An ITD is decision-first: the title states the decision, the problem states what is being solved, the options show what was considered, and the rationale records the decisive factor.

## ITD Template

```md
# ITD N: [The decision]

## The Problem
One sentence stating what we are trying to solve.

## Options Considered
1. Use option A
2. **Use selected option B**
3. Use option C

## Rationale
The decisive factor or factors that drove the decision.

## Notes
Optional additional context.
```

## Current ITDs

- [ITD 1: Use Expo React Native for the mobile frontend](/advanced/itds/001-use-expo-react-native.md)
- [ITD 2: Use a Bare worklet backend for local product data operations](/advanced/itds/002-use-bare-worklet-backend.md)
- [ITD 3: Use bare-rpc for frontend/backend communication](/advanced/itds/003-use-bare-rpc.md)
- [ITD 4: Use Corestore, Autobase, and Hyperbee for product persistence](/advanced/itds/004-use-corestore-autobase-hyperbee.md)
- [ITD 5: Use app-owned storage paths passed from React Native to Bare](/advanced/itds/005-use-app-owned-storage-paths.md)
- [ITD 6: Treat backend bundles as generated artifacts](/advanced/itds/006-treat-backend-bundles-as-generated-artifacts.md)
- [ITD 7: Cover backend services with integration tests](/advanced/itds/007-cover-backend-services-with-integration-tests.md)
