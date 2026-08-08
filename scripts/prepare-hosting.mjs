import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const source = resolve(".openai", "hosting.json");
const destination = resolve("dist", ".openai", "hosting.json");

mkdirSync(dirname(destination), { recursive: true });
copyFileSync(source, destination);

const serverDirectory = resolve("dist", "server");
const serverModule = resolve(serverDirectory, "index.mjs");
const serverEntry = resolve(serverDirectory, "index.js");
const ssrModule = resolve(serverDirectory, "ssr", "index.mjs");
const ssrEntry = resolve(serverDirectory, "ssr", "index.js");

if (existsSync(serverModule) && !existsSync(serverEntry)) {
  writeFileSync(serverEntry, 'export * from "./index.mjs";\nexport { default } from "./index.mjs";\n');
}

if (existsSync(ssrModule) && !existsSync(ssrEntry)) {
  writeFileSync(ssrEntry, 'export * from "./index.mjs";\nexport { default } from "./index.mjs";\n');
}

writeFileSync(resolve(serverDirectory, "package.json"), '{"type":"module"}\n');
