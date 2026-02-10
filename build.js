/**
 * Build script: Combine CSS and JS into a single HTML file (main.html)
 *
 * Usage: node build.js
 *
 * - Replaces <link rel="stylesheet" href="style.css"> with inline <style>...</style>
 * - Replaces <script src="main.js"></script> with inline <script>...</script>
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

const htmlPath = path.join(ROOT, 'index.html');
const cssPath = path.join(ROOT, 'style.css');
const jsPath = path.join(ROOT, 'main.js');
const distDir = path.join(ROOT, 'dist');
const outputPath = path.join(distDir, 'index.html');

// Read source files
const html = fs.readFileSync(htmlPath, 'utf-8');
const css = fs.readFileSync(cssPath, 'utf-8');
const js = fs.readFileSync(jsPath, 'utf-8');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Replace CSS link with inline <style>
let output = html.replace(
    /<link\s+rel=["']stylesheet["']\s+href=["']style\.css["']\s*\/?>/,
    `<style>\n${css}\n    </style>`
);

// Replace JS script tag with inline <script>
output = output.replace(
    /<script\s+src=["']main\.js["']\s*><\/script>/,
    `<script>\n${js}\n    </script>`
);

// Write output
fs.writeFileSync(outputPath, output, 'utf-8');

console.log(`✅ Build thành công → ${outputPath}`);
console.log(`   HTML: ${htmlPath}`);
console.log(`   CSS:  ${css.length} bytes (inlined)`);
console.log(`   JS:   ${js.length} bytes (inlined)`);
