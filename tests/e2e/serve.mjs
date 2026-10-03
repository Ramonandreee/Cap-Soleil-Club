// Servidor estático para os testes: serve dist/ com os cabeçalhos de
// public/_headers (inclusive a CSP) e com compressão, como a Cloudflare faz em produção.
// Uso: node tests/e2e/serve.mjs [porta]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { gzipSync } from "node:zlib";

const root = new URL("../../dist/", import.meta.url).pathname;
const port = Number(process.argv[2] ?? 4400);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
};

/** Lê o bloco "/*" do _headers. */
async function globalHeaders() {
  const text = await readFile(join(root, "_headers"), "utf8");
  const headers = {};
  let inBlock = false;
  for (const line of text.split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    if (!line.startsWith(" ")) {
      inBlock = line.trim() === "/*";
      continue;
    }
    if (inBlock) {
      const [name, ...rest] = line.trim().split(":");
      headers[name] = rest.join(":").trim();
    }
  }
  return headers;
}

const security = await globalHeaders();

async function resolve(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  const candidates = clean.endsWith("/") ? [join(clean, "index.html")] : [clean, `${clean}.html`];
  for (const candidate of candidates) {
    const file = join(root, candidate);
    if (!file.startsWith(root)) continue;
    try {
      if ((await stat(file)).isFile()) return file;
    } catch {
      // tenta o próximo
    }
  }
  return null;
}

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const file = await resolve(url.pathname);
  const target = file ?? join(root, "404.html");
  let body = await readFile(target);
  const type = types[extname(target)] ?? "application/octet-stream";
  const headers = { ...security, "Content-Type": type };
  if (/text|javascript|svg|xml/.test(type) && /gzip/.test(req.headers["accept-encoding"] ?? "")) {
    body = gzipSync(body);
    headers["Content-Encoding"] = "gzip";
  }
  if (url.pathname.startsWith("/_astro/")) headers["Cache-Control"] = "public, max-age=31536000, immutable";
  res.writeHead(file ? 200 : 404, headers);
  res.end(body);
}).listen(port, () => console.log(`dist em http://localhost:${port}`));
