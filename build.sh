#!/usr/bin/env bash
# build.sh — bundles index.html + its <link>/<script src> files into one self-contained
# dist/tharpanam.html, so the app can be shared over WhatsApp/email and opened from file://.
# Works with macOS BSD tools or GNU tools; the core path needs only bash/sed/awk/cat.
set -euo pipefail

SRC_INDEX="index.html"
OUT="dist/tharpanam.html"
MINIFY=0
OPEN_AFTER=0

usage() {
  cat <<'EOF'
Usage: ./build.sh [options]

Bundles index.html (and the stylesheet/scripts it references, in order) into a single
self-contained HTML file that works offline from file://.

Options:
  --minify       Minify CSS and JS in the bundle (uses `npx esbuild` if node/npx is
                 available; otherwise falls back to a safe whitespace-only minifier).
  --open         Open the built file after bundling (macOS `open` / `xdg-open`).
  -o <path>      Custom output path (default: dist/tharpanam.html).
  -h, --help     Show this help.
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --minify) MINIFY=1; shift ;;
    --open) OPEN_AFTER=1; shift ;;
    -o) OUT="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
  esac
done

if [ ! -f "$SRC_INDEX" ]; then
  echo "error: $SRC_INDEX not found (run this from the project root)" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUT")"
WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

# ---- 1. Extract the stylesheet <link> path and the ordered <script src> paths from index.html ----
CSS_PATH="$(grep -o '<link[^>]*rel="stylesheet"[^>]*>' "$SRC_INDEX" | head -1 | grep -o 'href="[^"]*"' | sed 's/href="//;s/"$//')"
grep -o '<script[^>]*src="[^"]*"[^>]*></script>' "$SRC_INDEX" | grep -o 'src="[^"]*"' | sed 's/src="//;s/"$//' > "$WORKDIR/scripts.txt"

if [ -z "${CSS_PATH:-}" ]; then
  echo "error: could not find a stylesheet <link> in $SRC_INDEX" >&2
  exit 1
fi
if [ ! -s "$WORKDIR/scripts.txt" ]; then
  echo "error: could not find any <script src> tags in $SRC_INDEX" >&2
  exit 1
fi

echo "Stylesheet: $CSS_PATH"
echo "Scripts ($(wc -l < "$WORKDIR/scripts.txt" | tr -d ' ')):"
sed 's/^/  - /' "$WORKDIR/scripts.txt"

# ---- 2. Concatenate JS (each file prefixed with a path comment unless minifying) ----
: > "$WORKDIR/bundle.js"
while IFS= read -r script_path; do
  if [ "$MINIFY" -eq 0 ]; then
    printf '/* ---- %s ---- */\n' "$script_path" >> "$WORKDIR/bundle.js"
  fi
  cat "$script_path" >> "$WORKDIR/bundle.js"
  printf '\n' >> "$WORKDIR/bundle.js"
done < "$WORKDIR/scripts.txt"

cp "$CSS_PATH" "$WORKDIR/bundle.css"

JS_SIZE_BEFORE=$(wc -c < "$WORKDIR/bundle.js" | tr -d ' ')
CSS_SIZE_BEFORE=$(wc -c < "$WORKDIR/bundle.css" | tr -d ' ')
MINIFIER="none"

# ---- 3. Optional minification ----
if [ "$MINIFY" -eq 1 ]; then
  if command -v npx >/dev/null 2>&1 && npx --yes esbuild --version >/dev/null 2>&1; then
    MINIFIER="esbuild"
    npx --yes esbuild --minify --loader=js < "$WORKDIR/bundle.js" > "$WORKDIR/bundle.min.js" 2>"$WORKDIR/esbuild-js.log" \
      || { echo "esbuild JS minify failed, falling back to safe minifier:"; cat "$WORKDIR/esbuild-js.log" >&2; MINIFIER="safe-fallback"; }
    if [ "$MINIFIER" = "esbuild" ]; then
      mv "$WORKDIR/bundle.min.js" "$WORKDIR/bundle.js"
      npx --yes esbuild --minify --loader=css < "$WORKDIR/bundle.css" > "$WORKDIR/bundle.min.css" 2>"$WORKDIR/esbuild-css.log" \
        || { echo "esbuild CSS minify failed, falling back to safe minifier:"; cat "$WORKDIR/esbuild-css.log" >&2; MINIFIER="safe-fallback"; }
      [ -f "$WORKDIR/bundle.min.css" ] && mv "$WORKDIR/bundle.min.css" "$WORKDIR/bundle.css"
    fi
  else
    MINIFIER="safe-fallback"
  fi

  if [ "$MINIFIER" = "safe-fallback" ]; then
    # Safe fallback: JS — strip blank lines and leading indentation only (no comment removal,
    # since a naive strip could break `//` inside strings/regex or `/* */` inside template text).
    sed -e 's/^[[:space:]]*//' -e '/^$/d' "$WORKDIR/bundle.js" > "$WORKDIR/bundle.safe.js" && mv "$WORKDIR/bundle.safe.js" "$WORKDIR/bundle.js"
    # Safe fallback: CSS — strip /* */ comments, then collapse whitespace.
    awk 'BEGIN{RS="\0"} { gsub(/\/\*([^*]|\*[^\/])*\*\//, ""); print }' "$WORKDIR/bundle.css" > "$WORKDIR/bundle.nocomments.css"
    tr '\n\t' '  ' < "$WORKDIR/bundle.nocomments.css" | sed -e 's/  */ /g' -e 's/ *{ */{/g' -e 's/ *} */}/g' -e 's/; */;/g' -e 's/: */:/g' > "$WORKDIR/bundle.safe.css"
    mv "$WORKDIR/bundle.safe.css" "$WORKDIR/bundle.css"
  fi
  echo "Minifier used: $MINIFIER"
fi

JS_SIZE_AFTER=$(wc -c < "$WORKDIR/bundle.js" | tr -d ' ')
CSS_SIZE_AFTER=$(wc -c < "$WORKDIR/bundle.css" | tr -d ' ')

# ---- 4. Escape any literal `</script` so it can't prematurely close our inline <script> ----
sed 's#</script#<\\/script#g' "$WORKDIR/bundle.js" > "$WORKDIR/bundle.escaped.js"
mv "$WORKDIR/bundle.escaped.js" "$WORKDIR/bundle.js"

# ---- 5. Rebuild index.html: replace the stylesheet <link> with inline <style>, and collapse
#         every <script src> tag into ONE inline <script> placed where the FIRST one was. ----
CSS_ESCAPED_PATH=$(printf '%s\n' "$CSS_PATH" | sed 's/[.[\*^$/]/\\&/g')

awk -v css_path="$CSS_PATH" '
  index($0, "<link") > 0 && index($0, "rel=\"stylesheet\"") > 0 && index($0, css_path) > 0 { print "__CSS_PLACEHOLDER__"; next }
  { print }
' "$SRC_INDEX" > "$WORKDIR/step1.html"

awk '
  /<script[^>]*src="[^"]*"[^>]*><\/script>/ {
    if (seen == 0) { print "__JS_PLACEHOLDER__"; seen = 1 }
    next
  }
  { print }
' "$WORKDIR/step1.html" > "$WORKDIR/step2.html"

if [ "$MINIFY" -eq 1 ]; then
  # Conservative whitespace collapse between tags (never touches script/style contents,
  # since those are injected as single blocks afterwards, and this runs before that splice).
  awk '{ gsub(/^[ \t]+|[ \t]+$/, ""); if (length($0) > 0) print }' "$WORKDIR/step2.html" \
    | tr '\n' ' ' | sed -e 's/  */ /g' -e 's/> </></g' > "$WORKDIR/step2.compact.html"
  printf '\n' >> "$WORKDIR/step2.compact.html"
  mv "$WORKDIR/step2.compact.html" "$WORKDIR/step2.html"
fi

# Splice in the CSS and JS with awk's getline (portable across BSD and GNU awk).
# NOTE: in --minify mode step2.html has been collapsed to (almost) a single line, so a
# placeholder may share its line with other markup. We must replace just the placeholder
# substring and preserve whatever prefix/suffix text shares that line (not `next` the
# whole record, which would silently discard sibling content on the same line).
awk -v cssfile="$WORKDIR/bundle.css" -v marker="__CSS_PLACEHOLDER__" '
{
  line = $0
  idx = index(line, marker)
  if (idx > 0) {
    prefix = substr(line, 1, idx - 1)
    suffix = substr(line, idx + length(marker))
    if (length(prefix) > 0) printf "%s\n", prefix
    print "<style>"
    while ((getline cssline < cssfile) > 0) print cssline
    print "</style>"
    if (length(suffix) > 0) print suffix
  } else {
    print line
  }
}
' "$WORKDIR/step2.html" > "$WORKDIR/step3.html"
awk -v jsfile="$WORKDIR/bundle.js" -v marker="__JS_PLACEHOLDER__" '
{
  line = $0
  idx = index(line, marker)
  if (idx > 0) {
    prefix = substr(line, 1, idx - 1)
    suffix = substr(line, idx + length(marker))
    if (length(prefix) > 0) printf "%s\n", prefix
    print "<script>"
    while ((getline jsline < jsfile) > 0) print jsline
    print "</script>"
    if (length(suffix) > 0) print suffix
  } else {
    print line
  }
}
' "$WORKDIR/step3.html" > "$OUT"

if grep -q '<script[^>]*src=' "$OUT" 2>/dev/null; then
  echo "error: bundling failed — <script src> tags remain in $OUT" >&2
  exit 1
fi
if grep -Eq '<link[^>]*rel="stylesheet"' "$OUT" 2>/dev/null; then
  echo "error: bundling failed — a stylesheet <link> remains in $OUT" >&2
  exit 1
fi

FINAL_SIZE=$(wc -c < "$OUT" | tr -d ' ')
echo ""
echo "Built: $OUT"
echo "  JS:  $JS_SIZE_BEFORE -> $JS_SIZE_AFTER bytes (minifier: $MINIFIER)"
echo "  CSS: $CSS_SIZE_BEFORE -> $CSS_SIZE_AFTER bytes"
echo "  Total output size: $FINAL_SIZE bytes"

if [ "$OPEN_AFTER" -eq 1 ]; then
  if command -v open >/dev/null 2>&1; then open "$OUT"
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$OUT"
  else echo "note: no 'open'/'xdg-open' found; open $OUT manually"; fi
fi
