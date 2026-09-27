# Tharpanam Helper

A single-page, offline app that generates a personalised, ordered tharpanam script: sankalpam, avahanam, tharpanam lines per ancestor, poonal-change markers, karunya pitrus and abhivadaye. It covers Amavasya, Mahalaya and Mahalaya Amavasya (Smartha / Krishna Yajur / Apasthamba).

Design and domain rules are in [ANALYSIS.md](ANALYSIS.md).

> ⚠️ Ritual content is seed data from public sources. Anything marked **[VERIFY]** should be checked with your family vadhyar. All ritual content lives in `data/`, so corrections don't need code changes.

## Use

Open `dist/tharpanam.html` in any browser. It is one self-contained file that works offline and can be shared over WhatsApp or email. Everything you enter is saved in that browser's localStorage and restored next time. Use **Export profile** to move it to another device.

## Develop

Open `index.html` directly (it works from `file://`), or serve the folder:

```bash
python3 -m http.server 8790
```

- Source files are plain scripts (no modules, no build step), each registering on `window.Thar`. The load order is the order of the `<script>` tags in `index.html`.
- `js/engine/*` is pure and DOM-free. `js/ui/*` renders the page.
- UI text goes through `Thar.i18n.t(key)` (`i18n/en.js`, `i18n/ta.js`). Mantras are stored in IAST and shown in the chosen script by `js/translit.js`.

## Test

```bash
node tests/run-node.js
```

Or open `tests.html` in a browser.

## Build the single file

```bash
./build.sh
```

| Flag | Effect |
|---|---|
| `--minify` | Minify CSS and JS. Uses `npx esbuild` when Node is available; otherwise a safe whitespace-only pass |
| `-o <path>` | Output path (default `dist/tharpanam.html`) |
| `--open` | Open the result when done |
| `-h` | Help |
