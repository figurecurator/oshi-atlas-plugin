// Package shared sources with an optional registered ChatGPT MCP connection.
// Requires Node.js 18+ and tar (included in current Windows, macOS and Linux).
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = fileURLToPath(new URL("../", import.meta.url));
const args = process.argv.slice(2);
let appId;
let output;
for (let i = 0; i < args.length; i++) {
  const flag = args[i];
  if (!["--app-id", "--output"].includes(flag) || !args[i + 1] || args[i + 1].startsWith("--")) {
    throw new Error("Usage: node scripts/package-chatgpt.mjs [--app-id VERIFIED_ATLAS_APP_ID] [--output archive.tar.gz]");
  }
  const value = args[++i];
  if (flag === "--app-id") appId = value;
  else output = value;
}
if (appId && !/^asdk_app_[A-Za-z0-9][A-Za-z0-9_-]*$/.test(appId)) {
  throw new Error("Use the verified asdk_app_ ID from the Atlas connection's .app.json");
}

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const manifest = readJson("plugin.json");
const extension = manifest.extensions["com.openai"];
assert.equal(manifest.$schema, "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json");
assert.equal(manifest.name, "oshi-atlas");
assert.equal(readJson(".claude-plugin/plugin.json").version, manifest.version);
assert(!extension.apps, "Keep account-specific app bindings out of the portable source");
assert(extension.interface.shortDescription.length <= 30, "Subtitle exceeds 30 characters");

const mcp = readJson("mcp.json");
const server = mcp.mcpServers["oshi-atlas"];
assert.equal(mcp.$schema, "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json");
assert.equal(server.url, "https://figure-curator.com/mcp/atlas");
assert.equal(server.url, readJson(".mcp.json").mcpServers["oshi-atlas"].url);
assert.equal(server.type, "streamable-http");
assert.equal(server.extensions["com.openai"].auth.type, "none");
for (const key of ["logo", "composerIcon"]) {
  const asset = path.resolve(root, extension.interface[key]);
  assert(!path.relative(root, asset).startsWith("..") && fs.statSync(asset).isFile(), `Invalid ${key}`);
}

const dist = path.join(root, "dist");
fs.mkdirSync(dist, { recursive: true });
const kind = appId ? "account" : "portable";
const archive = output ? path.resolve(output) : path.join(dist, `oshi-atlas-${manifest.version}-${kind}.tar.gz`);
assert(archive.endsWith(".tar.gz"), "Output must be a .tar.gz archive");
assert(!fs.existsSync(archive), "Output already exists; choose a new path instead of overwriting it");
const stage = fs.mkdtempSync(path.join(dist, ".package-"));
const plugin = path.join(stage, "oshi-atlas");
try {
  fs.mkdirSync(plugin);
  for (const item of ["mcp.json", "README.md", "LICENSE", "skills", "assets"]) {
    const source = path.join(root, item);
    // Refuse symlinks at any depth before copying package inputs.
    const check = (file) => {
      const stat = fs.lstatSync(file);
      assert(!stat.isSymbolicLink(), `Symlink is not a package input: ${file}`);
      if (stat.isDirectory()) for (const name of fs.readdirSync(file)) check(path.join(file, name));
    };
    check(source);
    fs.cpSync(source, path.join(plugin, item), { recursive: true });
  }
  if (appId) {
    extension.apps = "./.app.json";
    fs.writeFileSync(path.join(plugin, ".app.json"), JSON.stringify({ apps: { "oshi-atlas": { id: appId } } }, null, 2) + "\n");
  }
  fs.writeFileSync(path.join(plugin, "plugin.json"), JSON.stringify(manifest, null, 2) + "\n");
  fs.mkdirSync(path.dirname(archive), { recursive: true });
  const runTar = (tarArgs) => {
    const result = spawnSync("tar", tarArgs, { encoding: "utf8", windowsHide: true });
    if (result.error) throw result.error;
    assert.equal(result.status, 0, result.stderr);
    return result.stdout;
  };
  runTar(["-czf", archive, "-C", stage, "oshi-atlas"]);
  const files = runTar(["-tzf", archive]).trim().split(/\r?\n/);
  assert(files.every((file) => file.startsWith("oshi-atlas/") && !file.split("/").includes("..")));
  assert(files.includes("oshi-atlas/skills/oshi-atlas/SKILL.md"));
  assert.equal(files.includes("oshi-atlas/.app.json"), Boolean(appId));
  console.log(JSON.stringify({ archive, version: manifest.version, registeredApp: appId ?? null, files }, null, 2));
} finally {
  // Only remove the fresh staging directory created inside this repo's dist.
  assert.equal(path.dirname(path.resolve(stage)), path.resolve(dist));
  assert(path.basename(stage).startsWith(".package-"));
  fs.rmSync(stage, { recursive: true });
}
