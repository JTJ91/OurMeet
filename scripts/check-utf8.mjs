import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

const IGNORE_DIRS = new Set([
  ".git",
  ".next",
  "node_modules",
  ".vercel",
  "dist",
  "build",
  "coverage",
]);

const TEXT_EXT = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".css",
  ".scss",
  ".html",
  ".md",
  ".yml",
  ".yaml",
  ".svg",
  ".mjs",
  ".cjs",
  ".mts",
  ".cts",
  ".txt",
]);

const UTF8_DECODER = new TextDecoder("utf-8", { fatal: true });

function shouldCheckFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return TEXT_EXT.has(ext);
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const out = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      out.push(...(await walk(full)));
      continue;
    }

    if (!entry.isFile()) continue;
    if (shouldCheckFile(full)) out.push(full);
  }

  return out;
}

function isUtf16WithBom(buf) {
  return (
    (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) ||
    (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff)
  );
}

async function main() {
  const files = await walk(ROOT);
  const bad = [];

  for (const file of files) {
    const buf = await readFile(file);

    if (isUtf16WithBom(buf)) {
      bad.push({ file, reason: "UTF-16 BOM detected" });
      continue;
    }

    try {
      UTF8_DECODER.decode(buf);
    } catch {
      bad.push({ file, reason: "Invalid UTF-8 byte sequence" });
    }
  }

  if (bad.length > 0) {
    console.error("UTF-8 check failed. Non UTF-8 files:");
    for (const item of bad) {
      const rel = path.relative(ROOT, item.file).replaceAll("\\", "/");
      console.error(`- ${rel}: ${item.reason}`);
    }
    process.exit(1);
  }

  console.log(`UTF-8 check passed (${files.length} files).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
