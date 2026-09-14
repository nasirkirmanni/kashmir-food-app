#!/usr/bin/env python3
"""Check the WazwanWay blog drafts in ./blogs for SEO and editorial problems.

Standard library only. Run from the repository root:

    python3 docs/seo-blog-expansion/audit_drafts.py

It writes audit-report.md next to this file and prints a short summary.
The script does not judge accuracy. Its "review" lists are prompts for a
human editor, and every hit needs reading in context.
"""

import itertools
import math
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
BLOG_DIR = HERE / "blogs"
SITEMAP_FILE = HERE / "research" / "sitemap-paths.txt"
INVENTORY_FILE = HERE / "research" / "site-inventory.txt"
BLOG_DATA = REPO / "frontend" / "data" / "blogPosts.js"
META_TEXT = REPO / "frontend" / "lib" / "metaText.js"
REPORT = HERE / "audit-report.md"

TITLE_SUFFIX = " | Wazwan Way"   # added by the root layout's title template
TITLE_MAX = 60                   # characters, suffix included
META_DESC_MIN = 120
BODY_MIN_WORDS = 1500
FAQ_TARGET = 6
ALT_MAX = 125
SHINGLE = 8                      # words per shingle for overlap checks

START, END = "<!-- ARTICLE BODY START -->", "<!-- ARTICLE BODY END -->"
WORD = re.compile(r"[0-9A-Za-zÀ-ɏ₹]+(?:['’\-][0-9A-Za-zÀ-ɏ]+)*")
STOP = {"is", "in", "to", "what", "the", "of", "a", "and", "for", "from", "how", "do", "does"}

# Primary-keyword patterns the research summary says not to target yet.
AVOID_PRIMARY = ["recipe", "best restaurant", "best wazwan", "best food", "thali",
                 "price", "food tour", "near me", "wazwan meaning", "wazwan menu"]

REVIEW_PATTERNS = [
    ("superlative", r"\b(best|finest|greatest)\b"),
    ("absolute", r"\b(always|never|guarantee[sd]?)\b"),
    ("fame or popularity", r"\b(famous|most popular|most prized|best-known|iconic|legendary)\b"),
    ("age or origin", r"\b(ancient|centuries|oldest|legend)\b"),
    ("statistic", r"\d+(?:\.\d+)?\s?%"),
    ("price", r"(?:₹|\bRs\.?)\s?\d"),
]
ATTRIBUTION = re.compile(
    r"\(|according to|report|wikipedia|usda|kashmir life|monitor|pari|sahapedia|excelsior|"
    r"tribune|gulf news|outlook|etv|greater kashmir|business kashmir|journal|spices board|"
    r"incredible india|slurrp|goya|consumer", re.I)
DATED = re.compile(r"\b(19|20)\d{2}\b|\b(january|february|march|april|may|june|july|august|"
                   r"september|october|november|december)\b", re.I)


def meta_desc_max():
    """Read the truncation length from toMetaDescription(), falling back to 158."""
    if META_TEXT.exists():
        match = re.search(r"toMetaDescription\([^)]*?(\d{3})", META_TEXT.read_text())
        if match:
            return int(match.group(1))
    return 158


def split_row(line):
    cells = re.split(r"(?<!\\)\|", line.strip())
    return [c.strip().replace("\\|", "|") for c in cells[1:-1]]


def plain(md):
    md = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", md)
    md = re.sub(r"^\|[-| :]+\|\s*$", "", md, flags=re.M)
    return re.sub(r"[*_`#>|]", " ", md)


def words(md):
    return WORD.findall(plain(md))


def norm_tokens(s):
    return re.sub(r"[^a-z0-9 ]+", " ", s.lower()).split()


def has_phrase(haystack, phrase):
    return f" {' '.join(norm_tokens(phrase))} " in f" {' '.join(norm_tokens(haystack))} "


def field(meta, prefix):
    for key, value in meta.items():
        if key.lower().startswith(prefix.lower()):
            return value
    return ""


def section(text, heading):
    match = re.search(rf"^## {re.escape(heading)}[^\n]*\n(.*?)(?=^## |\Z)", text, flags=re.M | re.S)
    return match.group(1) if match else None


def clean_path(p):
    p = p.rstrip(".,;:")
    return p[:-1] if len(p) > 1 and p.endswith("/") else p


def parse(path):
    text = path.read_text(encoding="utf-8")
    head, _, rest = text.partition(START)
    body, _, tail = rest.partition(END)
    meta = {}
    for line in head.splitlines():
        if line.startswith("|") and not line.startswith("|---"):
            cells = split_row(line)
            if len(cells) >= 2 and cells[0] != "Field":
                meta[cells[0]] = cells[1]
    raw_meta_title = field(meta, "Meta title")
    m = re.match(r"(.*?)\s*\((\d+) characters before", raw_meta_title)
    meta_title, declared = (m.group(1), int(m.group(2))) if m else (raw_meta_title, None)

    heads = re.findall(r"^(#{1,6})\s+(.+?)\s*$", body, flags=re.M)
    faq_match = re.search(r"^## Frequently asked questions\s*$", body, flags=re.M)
    faq = len(re.findall(r"^### ", body[faq_match.end():], flags=re.M)) if faq_match else 0
    lines = body.splitlines()
    tables = sum(1 for i, l in enumerate(lines)
                 if l.startswith("|") and (i == 0 or not lines[i - 1].startswith("|")))
    intro = body.split("\n## ", 1)[0]

    body_links = [clean_path(p) for p in re.findall(r"\]\((/[^)\s#?]*)", body)]
    tail_links = [clean_path(p) for p in
                  re.findall(r"https://wazwanway\.com(/[^)\s#?]*)", tail)
                  + re.findall(r"^\s*-\s+(/[a-z0-9][a-z0-9/_-]*)\s*$", tail, flags=re.M)
                  + re.findall(r"(?:→|linking to)\s*(/[a-z0-9][a-z0-9/_-]*)", tail)
                  + re.findall(r"^\s*-\s+From\s+(/[a-z0-9][a-z0-9/_-]*)", tail, flags=re.M)]

    images = []
    img = section(tail, "Image suggestions")
    if img:
        rows = [split_row(l) for l in img.splitlines() if l.startswith("|") and not l.startswith("|---")]
        images = [r for r in rows[1:] if len(r) >= 3]

    return {
        "file": path.name, "text": text, "body": body, "tail": tail,
        "body_start_line": head.count("\n") + 1,
        "title": field(meta, "SEO title"), "h1": field(meta, "H1"),
        "primary": field(meta, "Primary keyword"),
        "secondary": [s.strip() for s in field(meta, "Secondary keywords").split(";") if s.strip()],
        "meta_title": meta_title, "declared": declared,
        "meta_desc": field(meta, "Meta description"), "slug": clean_path(field(meta, "URL slug")),
        "words": len(words(body)), "intro_words": len(words(intro)),
        "h1_in_body": [t for h, t in heads if h == "#"], "h2": [t for h, t in heads if h == "##"],
        "faq": faq, "tables": tables, "body_links": body_links, "tail_links": tail_links,
        "images": images,
        "sections": {s: section(tail, s) is not None for s in
                     ("Internal linking suggestions", "Image suggestions", "Suggested CTA",
                      "Fact-check sources (for editors; not for publication)")},
    }


def shingles(md):
    ws = [w.lower() for w in words(md)]
    return {" ".join(ws[i:i + SHINGLE]) for i in range(len(ws) - SHINGLE + 1)}


def sentences(md):
    out = []
    for s in re.split(r"(?<=[.!?])\s+|\n+", plain(md)):
        ws = WORD.findall(s)
        if len(ws) >= 10:
            out.append(" ".join(w.lower() for w in ws))
    return out


def main():
    desc_max = meta_desc_max()
    drafts = [parse(p) for p in sorted(BLOG_DIR.glob("[0-9][0-9]-*.md"))]
    sitemap = {clean_path(l.strip()) for l in SITEMAP_FILE.read_text().splitlines() if l.strip()}
    new_slugs = {d["slug"] for d in drafts}
    data_src = BLOG_DATA.read_text(encoding="utf-8") if BLOG_DATA.exists() else ""
    data_slugs = {f"/blog/{s}" for s in re.findall(r'slug:\s*"([^"]+)"', data_src)}
    # Published drafts are in blogPosts.js too; compare only against the other posts.
    existing_posts = {m.group(1): m.group(2) for m in
                      re.finditer(r'slug:\s*"([^"]+)".*?content:\s*`(.*?)`', data_src, flags=re.S)
                      if f"/blog/{m.group(1)}" not in new_slugs}
    inventory = []
    for line in INVENTORY_FILE.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^(/\S*) \| (.*?) \| H1: (.*?) \| ~(\d+) words", line)
        if m:
            inventory.append((m.group(1), m.group(2), m.group(3)))

    problems, out = [], []
    add = problems.append

    # Per-draft checks
    rows = []
    for d in drafts:
        f = d["file"]
        mt_total = len(d["meta_title"]) + len(TITLE_SUFFIX)
        title_total = len(d["title"]) + len(TITLE_SUFFIX)
        links_existing = sorted({p for p in d["body_links"] if p in sitemap})
        links_new = sorted({p for p in d["body_links"] if p in new_slugs})
        unknown = sorted({p for p in d["body_links"] + d["tail_links"]
                          if p not in sitemap and p not in new_slugs})
        kw = d["primary"]
        placement = {
            "title": has_phrase(d["title"], kw),
            "meta title": has_phrase(d["meta_title"], kw),
            "description": has_phrase(d["meta_desc"], kw),
            "first 100 words": has_phrase(" ".join(words(d["body"])[:100]), kw),
            "an H2": any(has_phrase(h, kw) for h in d["h2"]),
        }
        rows.append((d, mt_total, title_total, links_existing, links_new, unknown, placement))

        if d["words"] < BODY_MIN_WORDS:
            add(f"{f}: body is {d['words']} words (target {BODY_MIN_WORDS}+).")
        if d["faq"] != FAQ_TARGET:
            add(f"{f}: {d['faq']} FAQ questions (target {FAQ_TARGET}).")
        if d["h1_in_body"]:
            add(f"{f}: H1 inside the article body ({d['h1_in_body']}); the page template already renders the title as H1.")
        if "`" in d["body"] or "${" in d["body"]:
            add(f"{f}: body contains a backtick or '${{', which would break the template literal in blogPosts.js.")
        if mt_total > TITLE_MAX:
            add(f"{f}: meta title is {mt_total} characters with the suffix (max {TITLE_MAX}).")
        if d["declared"] is not None and d["declared"] != len(d["meta_title"]):
            add(f"{f}: meta title says {d['declared']} characters but is {len(d['meta_title'])}.")
        if not (META_DESC_MIN <= len(d["meta_desc"]) <= desc_max):
            add(f"{f}: meta description is {len(d['meta_desc'])} characters (aim for {META_DESC_MIN}-{desc_max}).")
        if d["title"] != d["h1"]:
            add(f"{f}: SEO title and H1 differ, but the template uses post.title for both.")
        if unknown:
            add(f"{f}: links not found in the sitemap or the new drafts: {', '.join(unknown)}.")
        if len(links_existing) < 3:
            add(f"{f}: only {len(links_existing)} distinct links to existing pages in the body (target 3+).")
        if not placement["title"] or not placement["meta title"]:
            add(f"{f}: primary keyword '{kw}' missing from the title or meta title.")
        if any(a in kw.lower() for a in AVOID_PRIMARY):
            add(f"{f}: primary keyword '{kw}' matches the avoid list.")
        if d["slug"] in sitemap:
            add(f"{f}: slug {d['slug']} already exists on the live site.")
        for name, present in d["sections"].items():
            if not present:
                add(f"{f}: missing section '{name}'.")
        for r in d["images"]:
            alt = r[2]
            if len(alt) > ALT_MAX:
                add(f"{f}: image alt text is {len(alt)} characters (max {ALT_MAX}): {alt[:60]}...")
            if re.match(r"(image|photo|picture) of", alt, re.I):
                add(f"{f}: alt text starts with a redundant 'image of': {alt[:60]}")

    # Uniqueness across drafts
    for key in ("slug", "title", "h1", "meta_title", "meta_desc", "primary"):
        seen = {}
        for d in drafts:
            seen.setdefault(d[key].strip().lower(), []).append(d["file"])
        for value, files in seen.items():
            if len(files) > 1:
                add(f"Duplicate {key} '{value}' in {', '.join(files)}.")

    # Cannibalisation between drafts
    cannibal = []
    for a, b in itertools.permutations(drafts, 2):
        if has_phrase(b["title"], a["primary"]):
            cannibal.append(f"{b['file']} title contains {a['file']}'s primary keyword '{a['primary']}'.")
        for s in b["secondary"]:
            if has_phrase(s, a["primary"]) or has_phrase(a["primary"], s):
                cannibal.append(f"{b['file']} secondary keyword '{s}' overlaps {a['file']}'s primary '{a['primary']}'.")

    # Overlap with existing pages (titles and H1s)
    site_overlap = []
    for d in drafts:
        tokens = {t for t in norm_tokens(d["primary"]) if t not in STOP}
        for path, title, h1 in inventory:
            if tokens and tokens <= set(norm_tokens(f"{title} {h1}")):
                site_overlap.append(f"{d['file']} ('{d['primary']}') vs {path}: \"{title}\"")

    # Text overlap between drafts, and with existing posts
    sh = {d["file"]: shingles(d["body"]) for d in drafts}
    pairs = []
    for a, b in itertools.combinations(drafts, 2):
        inter = sh[a["file"]] & sh[b["file"]]
        union = sh[a["file"]] | sh[b["file"]]
        pairs.append((len(inter), len(inter) / len(union) if union else 0, a["file"], b["file"]))
    pairs.sort(reverse=True)
    sent_owner = {}
    for d in drafts:
        for s in set(sentences(d["body"])):
            sent_owner.setdefault(s, []).append(d["file"])
    dup_sentences = [(s, files) for s, files in sent_owner.items() if len(files) > 1]
    existing_overlap = []
    ex_sh = {slug: shingles(content) for slug, content in existing_posts.items()}
    for d in drafts:
        best = max(((len(sh[d["file"]] & s), slug) for slug, s in ex_sh.items()), default=(0, "-"))
        existing_overlap.append((d["file"], best[0], best[1]))

    # Claims to review (article body only)
    review, seen_hits = [], set()
    for d in drafts:
        for offset, line in enumerate(d["body"].splitlines()):
            for label, pattern in REVIEW_PATTERNS:
                for m in re.finditer(pattern, line, flags=re.I):
                    if (d["file"], offset, label) in seen_hits:
                        continue
                    seen_hits.add((d["file"], offset, label))
                    note = ""
                    if label == "price":
                        note = "dated" if DATED.search(line) else "UNDATED"
                    if label == "statistic":
                        note = "attributed" if ATTRIBUTION.search(line) else "CHECK SOURCE"
                    lo = max(0, m.start() - 60)
                    snippet = line[lo:m.end() + 60].strip()
                    review.append((d["file"], d["body_start_line"] + offset, label, note, snippet))
    undated = [r for r in review if r[3] in ("UNDATED", "CHECK SOURCE")]
    for r in undated:
        add(f"{r[0]}:{r[1]}: {r[2]} {r[3]}: \"{r[4]}\"")

    # ---- Report ----
    out.append("# Draft audit report (generated)\n")
    out.append("Generated by `audit_drafts.py`. Re-run it after editing any draft. Every \"review\" hit needs "
               "reading in context; the script can't judge accuracy.\n")
    out.append(f"Limits: meta title <= {TITLE_MAX} characters including \"{TITLE_SUFFIX}\"; meta description "
               f"{META_DESC_MIN}-{desc_max} characters (the site truncates at {desc_max}); body "
               f"{BODY_MIN_WORDS}+ words; {FAQ_TARGET} FAQs.\n")
    out.append("## Per-draft summary\n")
    out.append("| Draft | Body words | Read time | Intro words | H2s | FAQs | Tables | Existing links | New-post links | "
               "Meta title (with suffix) | Meta description | Title (with suffix) | Needs `SEARCH_TITLES` | Keyword placement |")
    out.append("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|")
    for d, mt_total, title_total, le, ln, unknown, placement in rows:
        missing = [k for k, v in placement.items() if not v]
        out.append(
            f"| {d['file']} | {d['words']} | {math.ceil(d['words'] / 200)} min | {d['intro_words']} | {len(d['h2'])} | "
            f"{d['faq']} | {d['tables']} | {len(le)} | {len(ln)} | {mt_total} | {len(d['meta_desc'])} | {title_total} | "
            f"{'yes' if title_total > TITLE_MAX else 'no'} | "
            f"{'all' if not missing else 'missing: ' + ', '.join(missing)} |")
    out.append("")
    out.append(f"## Problems found ({len(problems)})\n")
    out.extend([f"- {p}" for p in problems] or ["- None."])
    out.append("")
    out.append("## Keyword cannibalisation between drafts\n")
    out.extend([f"- {c}" for c in cannibal] or ["- None found: no draft's title or secondary keywords contain another draft's primary keyword."])
    out.append("")
    out.append("## Primary keywords that already appear in existing page titles or H1s\n")
    out.extend([f"- {s}" for s in site_overlap] or ["- None."])
    out.append("")
    out.append(f"## Text overlap between drafts ({SHINGLE}-word shingles)\n")
    out.append("| Draft A | Draft B | Shared shingles | Jaccard |")
    out.append("|---|---|---|---|")
    for shared, jac, a, b in pairs[:12]:
        out.append(f"| {a} | {b} | {shared} | {jac:.3f} |")
    out.append("")
    out.append(f"**Sentences of 10+ words repeated word-for-word across drafts ({len(dup_sentences)}):**\n")
    out.extend([f"- \"{s[:160]}\" ({', '.join(files)})" for s, files in dup_sentences] or ["- None."])
    out.append("")
    out.append("## Overlap with existing WazwanWay blog posts\n")
    out.append("| Draft | Most shared shingles with one existing post | Existing post |")
    out.append("|---|---|---|")
    for f, n, slug in existing_overlap:
        out.append(f"| {f} | {n} | {slug} |")
    out.append("")
    out.append(f"## Claims to review ({len(review)} hits)\n")
    out.append("Superlatives, absolutes, fame claims, age claims, statistics and prices in the article bodies. "
               "Most will be fine in context; check each against the draft's fact-check sources.\n")
    out.append("| Draft | Line | Type | Note | Context |")
    out.append("|---|---|---|---|---|")
    for f, line_no, label, note, snippet in review:
        out.append(f"| {f} | {line_no} | {label} | {note} | {snippet.replace('|', '/')} |")
    out.append("")

    REPORT.write_text("\n".join(out), encoding="utf-8")
    print(f"Audited {len(drafts)} drafts -> {REPORT.relative_to(REPO)}")
    print(f"Problems: {len(problems)} | cannibalisation notes: {len(cannibal)} | "
          f"existing-page overlaps: {len(site_overlap)} | repeated sentences: {len(dup_sentences)} | "
          f"claims to review: {len(review)}")
    for p in problems:
        print(" -", p)


if __name__ == "__main__":
    main()
