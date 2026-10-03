// Prepara as fotos do roteiro para o site (ver .claude/skills/fotos-do-chat/SKILL.md).
//
// Para cada arquivo: descobre o código pelo nome ("Foto - H1 - v01.png" → H1),
// recorta na proporção do roteiro puxando para o foco da foto, limita o lado
// maior a 3840 px (nunca amplia) e salva em src/assets/photos/<código>.jpg
// (JPEG qualidade 90, sRGB, sem metadados). No fim, mostra um relatório.
//
// Uso:
//   npm run fotos -- <arquivos ou pastas>               prepara e salva
//   npm run fotos -- --conferir <arquivos ou pastas>    só o relatório, sem salvar
//   npm run fotos -- foto.png --codigo=H1 --foco=top    um arquivo com nome livre

import sharp from "sharp";
import { mkdir, readdir, stat } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { PHOTOS, codeFromName, cropFor, type Focus, type PhotoId } from "../src/lib/photos.ts";

const OUT = resolve(import.meta.dirname, "../src/assets/photos");
const MAX = 3840;
const IMAGE = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const FOCI = new Set<Focus>(["center", "left", "right", "top", "bottom"]);

const args = process.argv.slice(2);
const flag = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const dryRun = args.includes("--conferir");
const forcedCode = flag("codigo") as PhotoId | undefined;
const forcedFocus = flag("foco") as Focus | undefined;
const inputs = args.filter((a) => !a.startsWith("--"));

if (!inputs.length) {
  console.error("Uso: npm run fotos -- [--conferir] <arquivos ou pastas> [--codigo=H1] [--foco=center|left|right|top|bottom]");
  process.exit(1);
}
if (forcedCode && !(forcedCode in PHOTOS)) {
  console.error(`Código desconhecido: ${forcedCode}. Válidos: ${Object.keys(PHOTOS).join(", ")}`);
  process.exit(1);
}
if (forcedFocus && !FOCI.has(forcedFocus)) {
  console.error(`Foco desconhecido: ${forcedFocus}. Válidos: ${[...FOCI].join(", ")}`);
  process.exit(1);
}

async function expand(paths: string[]): Promise<string[]> {
  const files: string[] = [];
  for (const path of paths) {
    if ((await stat(path)).isDirectory()) {
      for (const name of (await readdir(path)).sort()) {
        if (IMAGE.has(extname(name).toLowerCase())) files.push(join(path, name));
      }
    } else files.push(path);
  }
  return files;
}

const version = (name: string) => Number(name.match(/v(\d+)/i)?.[1] ?? 0);

const files = await expand(inputs);
if (forcedCode && files.length !== 1) {
  console.error("--codigo só vale para um arquivo de cada vez.");
  process.exit(1);
}

// Um arquivo por código: se vierem várias versões, fica a de vNN mais alto.
const chosen = new Map<PhotoId, string>();
const problems: string[] = [];
for (const file of files) {
  const code = forcedCode ?? codeFromName(basename(file));
  if (!code) {
    problems.push(`${basename(file)}: sem código no nome (renomeie para "Foto - <código> - vNN.png" ou use --codigo=)`);
    continue;
  }
  const previous = chosen.get(code);
  if (!previous || version(basename(file)) > version(basename(previous))) chosen.set(code, file);
  if (previous) problems.push(`${code}: mais de um arquivo; usei ${basename(chosen.get(code)!)}`);
}

const rows: string[][] = [["Código", "Arquivo", "Original", "Recorte", "Final", "KB", "Situação"]];
if (!dryRun && chosen.size) await mkdir(OUT, { recursive: true });

for (const [code, file] of chosen) {
  const slot = PHOTOS[code];
  const meta = await sharp(file).metadata();
  // EXIF de 5 a 8 = foto girada 90°: largura e altura trocam depois do rotate().
  const turned = (meta.orientation ?? 1) >= 5;
  const width = turned ? meta.height! : meta.width!;
  const height = turned ? meta.width! : meta.height!;
  const box = cropFor(width, height, slot.ratio, forcedFocus ?? slot.focus);
  const scale = Math.min(1, MAX / Math.max(box.width, box.height));
  const finalW = Math.round(box.width * scale);
  const finalH = Math.round(box.height * scale);
  const long = Math.max(finalW, finalH);

  const situation =
    long >= slot.ideal
      ? "✅ ideal"
      : long >= slot.min
        ? "✅ acima do mínimo"
        : `⚠️ abaixo do mínimo (${long} px; o roteiro pede ${slot.min}, ideal ${slot.ideal})`;

  let kb = "—";
  if (!dryRun) {
    const target = join(OUT, `${code}.jpg`);
    const info = await sharp(file)
      .rotate()
      .extract(box)
      .resize({ width: finalW, height: finalH, kernel: "lanczos3" })
      .toColorspace("srgb")
      .jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: "4:4:4" })
      .toFile(target);
    kb = String(Math.round(info.size / 1024));
  }

  const cropped = box.width !== width || box.height !== height;
  rows.push([
    code,
    basename(file),
    `${width}×${height}`,
    cropped ? `${box.width}×${box.height} (${slot.ratio.join(":")}, ${forcedFocus ?? slot.focus})` : "não precisou",
    `${finalW}×${finalH}`,
    kb,
    situation,
  ]);
}

const widths = rows[0].map((_, i) => Math.max(...rows.map((r) => r[i].length)));
for (const [i, row] of rows.entries()) {
  console.log(row.map((cell, j) => cell.padEnd(widths[j])).join("  "));
  if (i === 0) console.log(widths.map((w) => "─".repeat(w)).join("  "));
}
for (const problem of problems) console.log(`• ${problem}`);
console.log(dryRun ? "\nNada foi salvo (--conferir)." : `\nSalvas em ${OUT}`);
