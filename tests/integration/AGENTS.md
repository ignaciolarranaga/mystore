# Integration Test Instructions

These are app integration tests for backend behavior. They verify the real backend service operations through the actual storage stack; they are not backend unit tests.

## Required Coverage

- Every backend operation/service addition or behavior change must include corresponding tests under `tests/integration`.
- Tests must exercise real backend services and storage behavior. Do not mock `productStore`, Corestore, Autobase, or Hyperbee for these integration tests.
- Product operation tests must verify observable behavior:
  - create persists records and created records can be fetched
  - get returns existing records and fails for missing records
  - list reflects create, update, and delete state
  - update persists changes and preserves expected identity fields
  - delete removes records from storage and list results

## Storage Isolation

- Use isolated temporary storage per test or suite.
- Set `Bare.argv` to the temporary storage path before importing backend modules.
- Reset module state between storage-root changes so backend singleton state cannot leak between tests.
- Never write test storage to `/data`, repo source directories, or developer home directories.

## Generated Artifacts

- Do not edit `backend/dist/**` directly.
- Do not edit `app/app.bundle.mjs` directly.
