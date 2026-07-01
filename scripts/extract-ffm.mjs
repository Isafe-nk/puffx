// scripts/extract-ffm.mjs — FFM Notion → lesson-content JSON
// Usage: node scripts/extract-ffm.mjs --module M0
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const NTN = `${process.env.HOME}/.local/bin/ntn`;
const NV = '2025-09-03';

// Module page IDs (each page's child_page blocks = its lessons, in order)
const MODULES = {
  M0: '38a37da0-aa46-8158-923e-c2aed8ac8952',
  M1: '38a37da0-aa46-8166-93a4-e779a848cecf',
  M2: '38a37da0-aa46-81ea-9fcf-f06320856bec',
  M3: '38a37da0-aa46-813a-ac82-cb21e0b5818b',
  M4: '38a37da0-aa46-8130-a040-d1173ff293b9',
  M5: '38b37da0-aa46-8193-83f5-c05a910e88d6',
  M6: '38b37da0-aa46-81ba-983a-df80cd919ef4',
  M7: '38b37da0-aa46-8125-aabf-dc8b685d99b2',
  M8: '38b37da0-aa46-81fa-87a6-e8190edc122f',
};

const FIELD_BY_EMOJI = {
  '🎯': 'hook', '🔁': 'recall', '💡': 'summary', '🧮': 'example',
  '📊': 'sources', '📌': 'takeaway', '✅': 'action',
  // '⚠️' (Verify) intentionally dropped
};

function children(id) {
  let out = [], cursor = null;
  do {
    const qs = `?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`;
    const raw = execSync(`${NTN} api "v1/blocks/${id}/children${qs}" --notion-version ${NV}`,
      { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
    const d = JSON.parse(raw);
    out = out.concat(d.results);
    cursor = d.has_more ? d.next_cursor : null;
  } while (cursor);
  return out;
}

function rt(arr) {
  return (arr || []).map((t) => {
    let s = t.plain_text || '';
    const a = t.annotations || {};
    if (a.code) s = '`' + s + '`';
    if (a.bold) s = '**' + s + '**';
    if (a.italic) s = '_' + s + '_';
    const url = t.href || t.text?.link?.url;
    if (url) s = `[${s}](${url})`;
    return s;
  }).join('');
}

// callouts are "**Label**   content" — drop leading bold label run(s)
function calloutValue(arr) {
  let i = 0;
  while (i < arr.length && arr[i].annotations?.bold) i++;
  return rt(arr.slice(i)).trim();
}

function parseLesson(pageId) {
  const blocks = children(pageId);
  const L = {};
  const body = [], my = [];
  let section = null; // 'body' | 'malaysia' | 'quiz'

  for (const b of blocks) {
    const t = b.type;
    if (t === 'callout') {
      const f = FIELD_BY_EMOJI[b.callout.icon?.emoji];
      if (f) L[f] = calloutValue(b.callout.rich_text);
      continue;
    }
    if (t === 'heading_3') {
      const h = rt(b.heading_3.rich_text);
      if (/understand it/i.test(h)) section = 'body';
      else if (/in malaysia/i.test(h)) section = 'malaysia';
      else if (/quick check/i.test(h)) section = 'quiz';
      else section = null;
      continue;
    }
    if (t === 'toggle') {
      if (section === 'quiz') {
        const q = rt(b.toggle.rich_text).replace(/^❓\s*/, '').trim();
        let a = '';
        if (b.has_children) {
          a = children(b.id)
            .map((k) => (k[k.type]?.rich_text ? rt(k[k.type].rich_text) : ''))
            .filter(Boolean).join('\n\n').trim();
        }
        L.quiz = { q, a };
      }
      continue;
    }
    if (t === 'paragraph' || t === 'bulleted_list_item' || t === 'numbered_list_item') {
      const text = rt(b[t].rich_text);
      if (!text.trim()) continue;
      const line = t === 'paragraph' ? text : `- ${text}`;
      if (section === 'body') body.push(line);
      else if (section === 'malaysia') my.push(line);
    }
  }
  L.body = body.join('\n\n');
  if (my.length) L.malaysia = my.join('\n\n');
  return L;
}

// --- main ---
const code = (process.argv[process.argv.indexOf('--module') + 1] || '').toUpperCase();
if (!MODULES[code]) { console.error(`Pass --module <M0..M8>. Got: "${code}"`); process.exit(1); }

const lessons = children(MODULES[code]).filter((b) => b.type === 'child_page');
const out = {};
for (const lp of lessons) {
  const id = (lp.child_page.title.match(/^(L\d+\.\d+)/) || [])[1];
  if (!id) { console.warn(`skip (no id): ${lp.child_page.title}`); continue; }
  out[id] = parseLesson(lp.id);
  console.log(`✓ ${id} — ${lp.child_page.title.replace(/^L\d+\.\d+\s*—\s*/, '')}`);
}

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'features', 'learn', 'content');
mkdirSync(dir, { recursive: true });
const file = join(dir, `${code.toLowerCase()}.json`);
writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
console.log(`\nWrote ${Object.keys(out).length} lessons → ${file}`);
