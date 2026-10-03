#!/usr/bin/env python3
"""Verificação "Documentação em dia" da Cap Soleil.

Roda no GitHub em todo PR e em todo push na main (.github/workflows/docs.yml),
e também no computador, na pasta do projeto:

    python3 scripts/check_docs.py

No PR, o workflow informa por variáveis de ambiente:
  CHANGED_FILES_PATH  arquivo com a lista de arquivos alterados (um por linha)
  PR_BODY             texto do PR

Regras explicadas em docs/como-trabalhamos.md › "Verificação automática".
Só usa a biblioteca padrão do Python (sem npm, sem pip).
"""

import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
IDENTITY = DOCS / "identidade-visual.md"
CSS = ROOT / "assets" / "css" / "styles.css"
PAGES = [ROOT / "index.html", ROOT / "privacy.html"]

# Arquivos que mudam o site e arquivos que contam como documentação.
SITE_PATHS = ("index.html", "privacy.html", "vercel.json", "assets/", "supabase/")
DOC_PATHS = ("README.md", "CLAUDE.md", "docs/")

FOUNDING_DATE = re.compile(r"\bEst\.?\s*(?:1[89]|20)\d{2}\b|\bEstablished\b|\bFounded\s+in\b", re.I)
UPDATED_LINE = re.compile(r"\*\*Atualizado em:\*\*\s*\d{4}-\d{2}-\d{2}")
# A linha precisa começar com "Docs: não se aplica" e trazer um motivo depois do travessão.
OPT_OUT = re.compile(r"^\s*Docs:\s*n[ãa]o se aplica\s*[—–-]\s*[^<\s].{2,}", re.I | re.M)

errors = []


def rel(path):
    return path.relative_to(ROOT).as_posix()


def matches(path, prefixes):
    return any(path == p or (p.endswith("/") and path.startswith(p)) for p in prefixes)


# ---------- Links entre documentos ----------

def strip_code(text):
    text = re.sub(r"```.*?```", "", text, flags=re.S)
    return re.sub(r"`[^`\n]*`", "", text)


def anchors(path, cache={}):
    """Âncoras que o GitHub gera para os títulos de um arquivo Markdown."""
    if path not in cache:
        seen, result = {}, set()
        for title in re.findall(r"^#{1,6}\s+(.+?)\s*#*\s*$", strip_code(path.read_text("utf-8")), re.M):
            title = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", title)  # [texto](link) -> texto
            slug = re.sub(r"[^\w\- ]", "", title.lower()).replace(" ", "-")
            n = seen.get(slug, 0)
            seen[slug] = n + 1
            result.add(slug if n == 0 else f"{slug}-{n}")
        cache[path] = result
    return cache[path]


def check_links():
    md_files = [ROOT / "README.md", ROOT / "CLAUDE.md", *sorted(DOCS.glob("*.md"))]
    for md in md_files:
        if not md.exists():
            continue
        for target in re.findall(r"\]\(([^)\s]+)\)", strip_code(md.read_text("utf-8"))):
            if re.match(r"(https?:|mailto:)", target):
                continue
            path_part, _, anchor = target.partition("#")
            dest = (md.parent / path_part).resolve() if path_part else md
            if not dest.exists():
                errors.append(f"{rel(md)}: link para um arquivo que não existe: {target}")
            elif anchor and dest.suffix == ".md" and anchor not in anchors(dest):
                errors.append(f"{rel(md)}: link para uma seção que não existe: {target}")


# ---------- Identidade visual do site ----------

def check_identity():
    if not IDENTITY.exists():
        errors.append("docs/identidade-visual.md não existe")
        return
    doc = IDENTITY.read_text("utf-8").lower()

    root = re.search(r":root\s*\{(.*?)\}", CSS.read_text("utf-8"), re.S)
    tokens = re.findall(r"(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\b", root.group(1) if root else "")
    if not tokens:
        errors.append("assets/css/styles.css: não encontrei as cores do :root")
    for name, value in tokens:
        if name.lower() not in doc or value.lower() not in doc:
            errors.append(
                f"Cor do site {name}: {value} não está em docs/identidade-visual.md › No site. "
                "Atualize a tabela de cores."
            )

    families = set()
    for page in PAGES:
        for href in re.findall(r'href="(https://fonts\.googleapis\.com/[^"]+)"', page.read_text("utf-8")):
            families.update(f.split(":")[0].replace("+", " ") for f in re.findall(r"family=([^&]+)", href))
    for family in sorted(families):
        if family.lower() not in doc:
            errors.append(
                f"Fonte do site {family} não está em docs/identidade-visual.md › No site. "
                "Atualize a tabela de fontes."
            )


# ---------- Regras da marca ----------

def check_brand():
    site_files = [*PAGES, *sorted((ROOT / "assets" / "js").glob("*.js"))]
    for path in site_files:
        for n, line in enumerate(path.read_text("utf-8").splitlines(), 1):
            hit = FOUNDING_DATE.search(line)
            if hit:
                errors.append(f"{rel(path)}:{n}: data de fundação (“{hit.group(0)}”). A marca não usa data de fundação.")


# ---------- Cabeçalho dos documentos ----------

def check_headers():
    for md in sorted(DOCS.glob("*.md")):
        if not UPDATED_LINE.search(md.read_text("utf-8")):
            errors.append(f"{rel(md)}: falta a linha “**Atualizado em:** AAAA-MM-DD” no topo")


# ---------- PR: mudou o site, mudou a documentação ----------

def check_pull_request():
    changed_path = os.environ.get("CHANGED_FILES_PATH")
    if not changed_path:
        return
    changed = [line.strip() for line in Path(changed_path).read_text("utf-8").splitlines() if line.strip()]
    site = [f for f in changed if matches(f, SITE_PATHS)]
    docs = [f for f in changed if matches(f, DOC_PATHS)]
    if site and not docs and not OPT_OUT.search(os.environ.get("PR_BODY") or ""):
        errors.append(
            "Este PR muda o site (" + ", ".join(site[:5]) + ("…" if len(site) > 5 else "") + ") "
            "mas não atualiza nenhum documento (README.md, CLAUDE.md ou docs/). "
            "Veja docs/como-trabalhamos.md › “Se mudou isto, atualize aquilo”. "
            "Se não houver nada a documentar, escreva no texto do PR uma linha: "
            "Docs: não se aplica — <motivo>"
        )


def main():
    check_links()
    check_identity()
    check_brand()
    check_headers()
    check_pull_request()
    if errors:
        print("✗ Documentação fora de dia:\n")
        for e in errors:
            print("  - " + e)
        print("\nRegras: docs/como-trabalhamos.md › Verificação automática")
        return 1
    print("✓ Documentação em dia.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
