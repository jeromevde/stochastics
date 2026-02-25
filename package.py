#!/usr/bin/env python3
"""
Package the quiz into a single self-contained HTML file.
"""

import argparse
import base64
import json
import re
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parent
QUESTIONS_DIR = ROOT / "questions"
INDEX_PATH = ROOT / "index.html"
REGISTRY_PATH = ROOT / "registry.js"
FRAME_CSS_PATH = QUESTIONS_DIR / "question-frame.css"
FRAME_JS_PATH = QUESTIONS_DIR / "question-frame.js"

KATEX_VERSION = "0.16.11"
KATEX_BASE = f"https://cdn.jsdelivr.net/npm/katex@{KATEX_VERSION}/dist/"
KATEX_CSS_URL = KATEX_BASE + "katex.min.css"
KATEX_JS_URL = KATEX_BASE + "katex.min.js"
KATEX_AUTORENDER_URL = KATEX_BASE + "contrib/auto-render.min.js"

MIME_OVERRIDES = {
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
}


def fetch(url: str, binary: bool = False):
    try:
        with urlopen(url) as resp:
            data = resp.read()
    except Exception as exc:  # pragma: no cover - network dependent
        raise RuntimeError(f"Failed to fetch {url}") from exc
    return data if binary else data.decode("utf-8")


def inline_katex_css(css: str) -> str:
    def replacer(match):
        font_path = match.group(1)
        font_url = KATEX_BASE + font_path
        font_bytes = fetch(font_url, binary=True)
        mime = MIME_OVERRIDES.get(Path(font_path).suffix.lower(), "application/octet-stream")
        encoded = base64.b64encode(font_bytes).decode("ascii")
        return f"url(data:{mime};base64,{encoded})"

    return re.sub(r"url\(['\"]?(fonts/[^\)\"']+)['\"]?\)", replacer, css)


def inline_question_assets(html: str, katex_css: str | None, katex_js: str | None,
                           katex_auto_js: str | None, frame_css: str, frame_js: str) -> str:
    if katex_css:
        html = re.sub(r'<link[^>]+katex\.min\.css[^>]*>', f"<style>{katex_css}</style>", html)
    if katex_js:
        html = re.sub(r'<script[^>]+katex\.min\.js[^>]*></script>', f"<script>{katex_js}</script>", html)
    if katex_auto_js:
        html = re.sub(r'<script[^>]+auto-render\.min\.js[^>]*></script>', f"<script>{katex_auto_js}</script>", html)

    html = re.sub(r'<link[^>]+question-frame\.css[^>]*>', f"<style>{frame_css}</style>", html)
    html = re.sub(r'<script[^>]+question-frame\.js[^>]*></script>', f"<script>{frame_js}</script>", html)
    return html


def build_embedded_questions(katex_css: str | None, katex_js: str | None,
                             katex_auto_js: str | None) -> dict:
    frame_css = FRAME_CSS_PATH.read_text(encoding="utf-8")
    frame_js = FRAME_JS_PATH.read_text(encoding="utf-8")
    encoded = {}

    for path in sorted(QUESTIONS_DIR.glob("*.html")):
        if not path.name[0].isdigit():
            continue
        raw = path.read_text(encoding="utf-8")
        inlined = inline_question_assets(raw, katex_css, katex_js, katex_auto_js, frame_css, frame_js)
        encoded[path.name] = base64.b64encode(inlined.encode("utf-8")).decode("ascii")

    return encoded


def embed_registry_and_questions(index_html: str, registry_js: str, question_map: dict) -> str:
    decoder = """
window.__embeddedQuestions = {};
(() => {
  const base64Map = %s;
  const decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder() : null;
  for (const [file, data] of Object.entries(base64Map)) {
    const binary = atob(data);
    if (decoder) {
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      window.__embeddedQuestions[file] = decoder.decode(bytes);
    } else {
      window.__embeddedQuestions[file] = decodeURIComponent(escape(binary));
    }
  }
})();
"""
    embed_script = decoder % json.dumps(question_map)

    replacement = (
        "<script>\n"
        f"{registry_js}\n"
        "</script>\n"
        "<script>\n"
        f"{embed_script}"
        "</script>"
    )

    if '<script src="registry.js"></script>' not in index_html:
        raise RuntimeError("Unable to find registry script tag in index.html")

    return index_html.replace('<script src="registry.js"></script>', replacement)


def main():
    parser = argparse.ArgumentParser(description="Bundle the quiz into a single HTML file.")
    parser.add_argument(
        "-o",
        "--output",
        default="stochastics-standalone.html",
        help="Output file path (default: stochastics-standalone.html in repo root)",
    )
    args = parser.parse_args()

    try:
        katex_css_raw = fetch(KATEX_CSS_URL)
        katex_css = inline_katex_css(katex_css_raw)
        katex_js = fetch(KATEX_JS_URL)
        katex_auto_js = fetch(KATEX_AUTORENDER_URL)
    except Exception as exc:  # pragma: no cover - network dependent
        print(f"Warning: could not inline KaTeX assets; packaged file will reference CDN URLs ({exc})")
        katex_css = katex_js = katex_auto_js = None

    question_map = build_embedded_questions(katex_css, katex_js, katex_auto_js)
    index_html = INDEX_PATH.read_text(encoding="utf-8")
    registry_js = REGISTRY_PATH.read_text(encoding="utf-8")

    packaged_html = embed_registry_and_questions(index_html, registry_js, question_map)

    output_path = Path(args.output)
    if not output_path.is_absolute():
        output_path = ROOT / output_path
    output_path.write_text(packaged_html, encoding="utf-8")

    print(f"Wrote {output_path} ({len(packaged_html) / 1024:.1f} KB) with {len(question_map)} embedded questions.")


if __name__ == "__main__":
    main()
