# ITD 3: Use bare-rpc for frontend/backend communication

## The Problem

How should the React Native app communicate with the Bare worklet backend?

## Options Considered

1. Use custom message parsing over the BareKit IPC stream
2. **Use bare-rpc for frontend/backend communication**
3. Expose product storage directly to the React Native app

## Rationale

`bare-rpc` provides a small request/response abstraction over the BareKit IPC stream. This gives the app clear product command boundaries while avoiding direct coupling between UI code and backend storage internals.

## Notes

Product commands are defined in `backend/commands.ts` and handled by the backend RPC dispatcher.
