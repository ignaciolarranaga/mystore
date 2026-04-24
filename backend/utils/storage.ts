/* global Bare */

import os from "bare-os";
import { fileURLToPath } from "bare-url";

/**
 * Determines the filesystem root for storing Corestore data. Prefers the Bare
 * runtime hint, then the OS home directory, and finally falls back to the tmp dir.
 *
 * @returns {string} Absolute path for persistent storage.
 */
export function resolveStorageRoot(): string {
  const hint =
    typeof Bare !== "undefined" && Bare.argv && Bare.argv[0]
      ? Bare.argv[0]
      : null;
  if (typeof hint === "string" && hint.trim()) {
    return asPath(hint.trim());
  }

  try {
    const home = os.homedir();
    if (home) {
      return home;
    }
  } catch {
    // Ignore and fall back to tmpdir.
  }

  return os.tmpdir();
}

/**
 * Converts a raw string or `file://` URL into a plain filesystem path.
 *
 * @param {string} value Raw path or file URL.
 * @returns {string} Resolved path.
 */
function asPath(value: string): string {
  if (value.startsWith("file:")) {
    try {
      return fileURLToPath(value);
    } catch {
      return value;
    }
  }

  return value;
}
