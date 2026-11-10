// note の画像を、その日の note のタイトルで作る（2026-11-10。記事ごとの画像の使い回しで、本文と画像が合わなかったため）
// 使い方：node scripts/note-eyecatch.mjs <投稿文書.md> [開始日 M/D]
//   各日の「## note」のタイトルと誘導先の記事の部から、design/export/note-MMDD.png（1280x670）を作る
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { ogSvg } from '../src/lib/og.ts';
import { CATEGORIES } from '../src/data/categories.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const [doc, from] = process.argv.slice(2);
const [fm, fd] = (from ?? '1/1').split('/').map(Number);
const text = readFileSync(doc, 'utf8');
const out = [];
for (const day of text.split(/^# (?=\d+月\d+日)/m).slice(1)) {
  const [, m, d] = day.match(/^(\d+)月(\d+)日/).map(Number);
  if (m * 100 + d < fm * 100 + fd) continue;
  const note = day.split(/^## note/m)[1];
  if (!note) continue;
  const title = note.match(/^タイトル\s*\n+(.+)$/m)?.[1].trim();
  const slug = note.match(/tatamu-hojin\.com\/posts\/([\w-]+)/)?.[1];
  if (!title || !slug) { console.log(`△ ${m}/${d} タイトルか記事が見つからない`); continue; }
  const cat = readFileSync(join(ROOT, 'src/content/posts', slug + '.mdx'), 'utf8').match(/^category:\s*(\w+)/m)[1];
  const i = CATEGORIES.findIndex((c) => c.id === cat);
  const svg = ogSvg({ title, part: CATEGORIES[i].name, partNo: cat === 'monthly' ? undefined : i, categoryId: cat, year: 1 });
  const name = `note-${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}.png`;
  const png = await sharp(Buffer.from(svg)).resize(1280, 670, { fit: 'fill' }).png().toBuffer();
  writeFileSync(join(ROOT, 'design/export', name), png);
  out.push(`${m}/${d}\t${name}\t${title}`);
}
console.log(out.join('\n'));
