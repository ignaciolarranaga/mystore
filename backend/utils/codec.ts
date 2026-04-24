export type EncodedPayload = string;

export const encode = (message: unknown): EncodedPayload =>
  JSON.stringify(message);

export const decode = <T>(
  buffer?: BareBuffer | string | null,
): T | undefined => {
  if (!buffer || buffer.length === 0) {
    return undefined;
  }

  const raw = typeof buffer === "string" ? buffer : buffer.toString();

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error("Invalid JSON to decode: " + raw);
  }
};
