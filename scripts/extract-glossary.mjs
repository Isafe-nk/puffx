// scripts/extract-glossary.mjs — FFM glossary handoff markdown → site JSON
// Input:  ~/FFM/handoffs/glossary-draft.md (exported by the content agent)
// Output: src/features/glossary/data/glossary.json
// Run: node scripts/extract-glossary.mjs
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SRC = `${process.env.HOME}/FFM/handoffs/glossary-draft.md`;
const md = readFileSync(SRC, 'utf8');

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const lines = md.split('\n');
const terms = [];
let cur = null;
const flush = () => { if (cur) { cur.definition = cur._def.join(' ').trim(); delete cur._def; terms.push(cur); } };

for (const raw of lines) {
  const line = raw.trim();
  if (line.startsWith('### ')) {
    flush();
    const term = line.slice(4).trim();
    cur = { term, slug: slugify(term), definition: '', modules: [], _def: [] };
    continue;
  }
  if (!cur) continue;                                   // skip header/intro
  if (line === '---') { flush(); cur = null; continue; } // end of terms section
  if (line.startsWith('*Modules:')) {
    cur.modules = (line.match(/M\d+/g)) || [];
    continue;
  }
  if (line.startsWith('**2026 figure:**')) {
    const body = line.replace('**2026 figure:**', '').trim();
    const idx = body.indexOf('Source:');
    if (idx >= 0) {
      cur.figure = body.slice(0, idx).trim().replace(/\.$/, '') + '.';
      cur.source = body.slice(idx + 'Source:'.length).trim().replace(/\.$/, '');
    } else {
      cur.figure = body;
    }
    continue;
  }
  if (line && !line.startsWith('>') && !line.startsWith('*') && !line.startsWith('#') && !line.startsWith('-')) {
    cur._def.push(line);
  }
}
flush();

const out = { terms: terms.sort((a, b) => a.term.localeCompare(b.term)) };
const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'features', 'glossary', 'data');
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, 'glossary.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`Wrote ${out.terms.length} terms → ${join(dir, 'glossary.json')}`);
console.log(`With verified figures: ${out.terms.filter((t) => t.figure).length}`);
