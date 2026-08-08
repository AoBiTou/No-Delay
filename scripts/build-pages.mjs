import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const proxyPath = resolve("proxy.ts");
const disabledProxyPath = resolve("proxy.ts.pages-disabled");
const nextEnvPath = resolve("next-env.d.ts");
const nextEnvContents = readFileSync(nextEnvPath);

if (existsSync(disabledProxyPath)) {
  throw new Error("A stale Pages build proxy backup already exists.");
}

let status = 1;

try {
  renameSync(proxyPath, disabledProxyPath);

  const result = spawnSync(
    process.execPath,
    [resolve("node_modules", "next", "dist", "bin", "next"), "build"],
    {
      env: { ...process.env, GITHUB_PAGES: "true" },
      stdio: "inherit",
    },
  );

  status = result.status ?? 1;

  if (status === 0) {
    writeFileSync(resolve("out", ".nojekyll"), "");
  }
} finally {
  if (existsSync(disabledProxyPath)) {
    renameSync(disabledProxyPath, proxyPath);
  }

  writeFileSync(nextEnvPath, nextEnvContents);
}

process.exit(status);
