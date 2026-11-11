// Replaces the __META_PIXEL_ID__ placeholder in every HTML page with the
// META_PIXEL_ID environment variable. Runs as the Vercel build command.
// Source files keep the placeholder so the ID is never hardcoded in the repo.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

const PLACEHOLDER = "__META_PIXEL_ID__";
const ROOT = process.cwd();
const SKIP = new Set(["node_modules", ".git", ".claude", "scripts"]);

const pixelId = (process.env.META_PIXEL_ID || "").trim();
if (!/^\d{5,20}$/.test(pixelId)) {
  console.error("META_PIXEL_ID is missing or not a numeric Meta Pixel ID. Set it in Vercel project settings.");
  process.exit(1);
}

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(full);
    else if (entry.name.endsWith(".html")) yield full;
  }
}

let replaced = 0;
for await (const file of htmlFiles(ROOT)) {
  const html = await readFile(file, "utf8");
  if (!html.includes(PLACEHOLDER)) continue;
  await writeFile(file, html.split(PLACEHOLDER).join(pixelId));
  replaced++;
  console.log(`Meta Pixel ID set in ${relative(ROOT, file)}`);
}
console.log(`Done. Updated ${replaced} file(s).`);
