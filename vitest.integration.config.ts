import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

const fromRoot = (path: string): string =>
  fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "bare-fs": fromRoot("./tests/integration/shims/bare-fs.ts"),
      "bare-os": fromRoot("./tests/integration/shims/bare-os.ts"),
      "bare-path": fromRoot("./tests/integration/shims/bare-path.ts"),
      "bare-url": fromRoot("./tests/integration/shims/bare-url.ts"),
    },
  },
  test: {
    include: ["tests/integration/**/*.test.ts"],
    fileParallelism: false,
  },
});
