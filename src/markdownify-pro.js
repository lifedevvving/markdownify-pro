#!/usr/bin/env node
'use strict';
/**
 * markdownify-pro — Convert HTML, DOCX to clean Markdown
 */

const { program } = require('commander');
const path = require('path');
const fs = require('fs');

const PKG = require('../package.json');

// ─── Helpers ────────────────────────────────────────────────────────────────

function log(msg, color = '\x1b[0m') {
  console.log(`${color}${msg}\x1b[0m`);
}
const green  = s => log(s, '\x1b[32m');
const yellow = s => log(s, '\x1b[33m');
const red    = s => log(s, '\x1b[31m');

function loadConfig(dir = process.cwd()) {
  const cfgPath = path.join(dir, '.markdownify.json');
  if (fs.existsSync(cfgPath)) {
    try { return JSON.parse(fs.readFileSync(cfgPath, 'utf8')); } catch {}
  }
  return {};
}

// ─── HTML → Markdown ────────────────────────────────────────────────────────

function htmlToMarkdown(html, config = {}) {
  let TurndownService, gfm;
  try {
    TurndownService = require('turndown');
    gfm = require('turndown-plugin-gfm');
  } catch {
    red('Missing dependencies. Run: npm install');
    process.exit(1);
  }

  const td = new TurndownService({
    headingStyle: config.headingStyle || 'atx',
    bulletListMarker: config.bulletListMarker || '-',
    codeBlockStyle: config.codeBlockStyle || 'fenced',
  });
  td.use(gfm.gfm);

  // Strip noise elements
  const strips = config.stripSelectors || ['script', 'style', 'noscript'];
  strips.forEach(sel => {
    td.remove(sel);
  });

  return td.turndown(html).trim();
}

// ─── DOCX → Markdown ────────────────────────────────────────────────────────

async function docxToMarkdown(inputPath) {
  let mammoth;
  try {
    mammoth = require('mammoth');
  } catch {
    red('Missing dependency: mammoth. Run: npm install');
    process.exit(1);
  }

  const result = await mammoth.convertToHtml({ path: inputPath });
  if (result.messages.length) {
    result.messages.forEach(m => yellow(`[docx] ${m.message}`));
  }
  return htmlToMarkdown(result.value);
}

// ─── URL fetch ──────────────────────────────────────────────────────────────

async function fetchUrl(url) {
  const { default: fetch } = await import('node-fetch').catch(() => {
    // Fallback: use built-in fetch (Node 18+)
    return { default: globalThis.fetch };
  });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

// ─── Commands ───────────────────────────────────────────────────────────────

program
  .name('markdownify-pro')
  .description('Convert HTML, DOCX files to clean Markdown')
  .version(PKG.version);

program
  .command('convert')
  .description('Convert a single file to Markdown')
  .requiredOption('-i, --input <file>', 'Input file (.html or .docx)')
  .option('-o, --output <file>', 'Output .md file')
  .option('-c, --config <dir>', 'Directory containing .markdownify.json')
  .action(async (opts) => {
    const config = loadConfig(opts.config || path.dirname(opts.input));
    const ext = path.extname(opts.input).toLowerCase();
    const outPath = opts.output || opts.input.replace(/\.[^.]+$/, '.md');

    yellow(`Converting: ${opts.input}`);

    let markdown;
    if (ext === '.html' || ext === '.htm') {
      const html = fs.readFileSync(opts.input, 'utf8');
      markdown = htmlToMarkdown(html, config);
    } else if (ext === '.docx') {
      markdown = await docxToMarkdown(opts.input);
    } else {
      red(`Unsupported file type: ${ext}. Supported: .html, .htm, .docx`);
      process.exit(1);
    }

    fs.writeFileSync(outPath, markdown + '\n', 'utf8');
    green(`✓ Saved: ${outPath} (${markdown.length} chars)`);
  });

program
  .command('url')
  .description('Fetch a URL and convert to Markdown')
  .requiredOption('-u, --url <url>', 'URL to fetch and convert')
  .option('-o, --output <file>', 'Output .md file (default: page.md)')
  .action(async (opts) => {
    yellow(`Fetching: ${opts.url}`);
    let html;
    try {
      html = await fetchUrl(opts.url);
    } catch (e) {
      red(`Failed to fetch ${opts.url}: ${e.message}`);
      process.exit(1);
    }
    const markdown = htmlToMarkdown(html);
    const outPath = opts.output || 'page.md';
    fs.writeFileSync(outPath, markdown + '\n', 'utf8');
    green(`✓ Saved: ${outPath} (${markdown.length} chars)`);
  });

program
  .command('batch')
  .description('Convert all matching files in a directory')
  .requiredOption('-d, --dir <directory>', 'Directory to process')
  .option('-e, --ext <ext>', 'File extension to match (html or docx)', 'html')
  .option('-o, --outdir <dir>', 'Output directory')
  .action(async (opts) => {
    const { glob } = require('glob');
    const inDir = path.resolve(opts.dir);
    const outDir = opts.outdir ? path.resolve(opts.outdir) : inDir;
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const pattern = path.join(inDir, `**/*.${opts.ext}`);
    const files = await glob(pattern, { nodir: true });

    if (!files.length) {
      yellow(`No .${opts.ext} files found in ${inDir}`);
      return;
    }

    yellow(`Found ${files.length} files. Converting...`);
    const config = loadConfig(inDir);

    for (const file of files) {
      const rel = path.relative(inDir, file);
      const outFile = path.join(outDir, rel.replace(/\.[^.]+$/, '.md'));
      fs.mkdirSync(path.dirname(outFile), { recursive: true });

      let markdown;
      if (opts.ext === 'docx') {
        markdown = await docxToMarkdown(file);
      } else {
        const html = fs.readFileSync(file, 'utf8');
        markdown = htmlToMarkdown(html, config);
      }
      fs.writeFileSync(outFile, markdown + '\n', 'utf8');
      green(`  ✓ ${rel} → ${path.relative(outDir, outFile)}`);
    }

    green(`\nBatch complete: ${files.length} files converted.`);
  });

program
  .command('demo')
  .description('Run a quick demo conversion')
  .action(() => {
    const sampleHtml = `
      <h1>Hello World</h1>
      <p>This is a <strong>demo</strong> of markdownify-pro.</p>
      <ul>
        <li>Converts <em>HTML</em> to Markdown</li>
        <li>Handles <code>inline code</code></li>
        <li>Tables, links, images too</li>
      </ul>
      <table>
        <tr><th>Feature</th><th>Status</th></tr>
        <tr><td>HTML</td><td>✓</td></tr>
        <tr><td>DOCX</td><td>✓</td></tr>
      </table>
    `;
    const md = htmlToMarkdown(sampleHtml);
    green('=== Demo Output ===\n');
    console.log(md);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
