declare interface BareGlobal {
  argv?: string[];
  on?(event: "teardown", handler: () => void): void;
}

declare interface BareKitGlobal {
  IPC: unknown;
}

type BareBuffer = Uint8Array & {
  toString(encoding?: string): string;
};

declare const Bare: BareGlobal | undefined;
declare const BareKit: BareKitGlobal;
declare const Buffer: {
  from(data: string | ArrayBuffer | ArrayBufferView): BareBuffer;
  from(data: ArrayLike<number>): BareBuffer;
};

