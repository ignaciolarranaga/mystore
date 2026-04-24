declare module "autobase" {
  export interface AutobaseAppendOptions<T = unknown> {
    scope?: string;
    product?: T;
    type?: string;
  }

  export default class Autobase<T = unknown> {
    constructor(source: any, options?: any, config?: any);
    readonly view: any;
    readonly local?: { key?: Uint8Array | null };
    readonly key: Uint8Array;
    readonly discoveryKey: Uint8Array;
    append(entry: T): Promise<void>;
    update(): Promise<void>;
    ready(): Promise<void>;
    close(): Promise<void>;
  }
}

declare module "corestore" {
  export default class Corestore {
    constructor(storage: string);
    namespace(name: string): any;
    get(options: { name: string }): any;
    close(): Promise<void>;
  }
}

declare module "hyperbee" {
  export interface HyperbeeCreateReadStreamOptions {
    gte?: string;
    lt?: string;
    limit?: number;
    reverse?: boolean;
  }

  export default class Hyperbee {
    constructor(core: any, options?: any);
    ready(): Promise<void>;
    close(): Promise<void>;
    get(key: string): Promise<{ value: any } | null>;
    batch(options?: { update?: boolean }): {
      put(key: string, value: any): Promise<void>;
      del(key: string): Promise<void>;
      flush(): Promise<void>;
      close(): Promise<void>;
    };
    createReadStream(options?: HyperbeeCreateReadStreamOptions): AsyncIterable<{
      key: string;
      value: any;
    }>;
  }
}

declare module "bare-path" {
  export function join(...segments: string[]): string;
}
