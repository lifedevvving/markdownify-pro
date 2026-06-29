# markdownify-pro

[![CI](https://github.com/YOUR_USERNAME/markdownify-pro/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/markdownify-pro/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/markdownify-pro.svg)](https://npmjs.com/package/markdownify-pro)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

> Convert HTML pages, PDFs, and Word docs to clean, readable Markdown.

## Features

- 🌐 **HTML → Markdown** — Clean conversion with GFM table support
- 📄 **DOCX → Markdown** — Word documents including formatting and tables
- 🗂️ **Batch processing** — Convert entire directories at once
- ✨ **Smart cleanup** — Strips scripts, ads, and noise automatically
- 🔧 **Configurable** — Custom rules via `.markdownify.json`

## Installation

```bash
npm install
```

## Usage

```bash
# Convert an HTML file
node src/markdownify-pro.js convert --input page.html --output page.md

# Convert a Word document
node src/markdownify-pro.js convert --input report.docx --output report.md

# Batch convert a directory
node src/markdownify-pro.js batch --dir ./docs --ext html

# Fetch and convert a URL
node src/markdownify-pro.js url --url https://example.com --output example.md

# Show help
node src/markdownify-pro.js --help
```

## Configuration

Create a `.markdownify.json` in your project root:

```json
{
  "headingStyle": "atx",
  "bulletListMarker": "-",
  "codeBlockStyle": "fenced",
  "stripSelectors": ["nav", "footer", ".ad", "#cookie-banner"],
  "outputDir": "./markdown"
}
```

## npm Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run the CLI |
| `npm test` | Run tests |
| `npm run tracker` | Show achievement progress |
| `npm run roadmap` | Show Day 1 → Month 1 roadmap |

## Achievement Scripts

```bash
bash scripts/setup.sh                                  # Initial setup
bash scripts/quickdraw.sh                              # Quickdraw achievement
bash scripts/yolo.sh                                   # YOLO achievement
bash scripts/publicist.sh                              # Publicist achievement
bash scripts/pull-shark.sh 2                           # Pull Shark (Bronze)
bash scripts/pair-extraordinaire.sh "Name" "email"     # Pair Extraordinaire
bash scripts/unlock-all.sh                             # Interactive menu
```

## License

MIT © Your Name
