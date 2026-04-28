# ITD 7: Cover backend services with integration tests

## The Problem

How should product backend behavior be verified when backend commands or services change?

## Options Considered

1. Rely only on manual mobile app testing
2. Test only UI behavior through React Native screens
3. **Cover backend services with integration tests**

## Rationale

Backend services own product command behavior and storage integration, so changes need integration tests close to that boundary. This catches persistence, command handling, and service behavior regressions without requiring every backend change to be verified manually through the mobile app.

## Notes

Integration tests live under `tests/integration`. Follow `tests/integration/AGENTS.md` when adding or changing those tests.
