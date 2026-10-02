const fs = require('fs');
const path = require('path');

const root = 'C:/Users/Admin/Desktop/PROTOTIPO';

for (const name of fs.readdirSync(root)) {
  if (!name.toLowerCase().endsWith('.html')) continue;

  const filePath = path.join(root, name);
  const html = fs.readFileSync(filePath, 'utf8');
  const styleRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  const matches = [...html.matchAll(styleRegex)];

  if (!matches.length) continue;

  const cssName = path.basename(name, '.html') + '.css';
  const cssPath = path.join(root, cssName);
  const cssContent = matches.map(match => match[1].trim()).filter(Boolean).join('\n\n');
  fs.writeFileSync(cssPath, cssContent, 'utf8');

  const newHtml = html.replace(styleRegex, '').replace(/<\/head>/i, `    <link rel="stylesheet" href="${cssName}">\n</head>`);
  fs.writeFileSync(filePath, newHtml, 'utf8');

  console.log(`${name} -> ${cssName}`);
}
