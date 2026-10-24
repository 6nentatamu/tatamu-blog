// 出す前の自動チェック（改善計画1）
// 使い方：node scripts/check.mjs <ファイル...>
//   投稿文書（editorial/投稿文書_*.md）と記事（src/content/posts/*.mdx）を判定する。
//   エラー（✗）が1つでもあれば終了コード1。警告（△）は人が読んで判断する。
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { basename, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const POSTS_DIR = join(ROOT, 'src/content/posts');

// 計画の中だけの言葉（投稿文の基準 ルール14）。見つけたら言い換える
const PLAN_TERMS = ['5,000通り', '5000通り', '成功率', '振れ幅', '基礎と裁量', '基礎生活費', '裁量', '余裕枠', 'モンテカルロ', '益金不算入'];
// 書き手.md にない気持ちを足していないか、人が確かめる語
const FEELING = ['思った', '思いました', '気づいた', '気づきました', '迷った', '迷いました', '不安でした', '嬉しかった', 'ほっとし', '驚きました', '怖かった'];
// 個人が特定される数字（品質基準 D1・投稿ルール6）
const IDENTITY = [
  [/\d+歳/, '年齢'],
  [/\d0代/, '年齢層'],
  [/前職\d+年|勤続\d+年|\d+年勤め/, '勤続年数'],
  [/20[4-9]\d年(に)?完済/, '年齢が推測できる完済年'],
  [/\d{1,2}月に(設立|作っ|作り|登記)/, '設立した月'],
  [/\d{1,2}月設立/, '設立した月'],
];
// 読者の期待を否定して終わる言い方（本人の指摘 10-23 ネガティブ）
const NEGATIVE_END = /(効きません|損です|損でした|できません|意味がありません|やめましょう)。?$/;

const errors = [];
const warns = [];
const err = (f, where, msg) => errors.push(`✗ ${f} ${where}：${msg}`);
const warn = (f, where, msg) => warns.push(`△ ${f} ${where}：${msg}`);

function prSlugs() {
  const set = new Set();
  for (const name of readdirSafe(POSTS_DIR)) {
    if (!name.endsWith('.mdx')) continue;
    const t = readFileSync(join(POSTS_DIR, name), 'utf8');
    if (/^pr:\s*true/m.test(t)) set.add(name.replace(/\.mdx$/, ''));
  }
  return set;
}
function readdirSafe(d) {
  try { return readdirSync(d); } catch { return []; }
}

function commonChecks(f, where, text, { isPost }) {
  for (const term of PLAN_TERMS) {
    if (text.includes(term)) (isPost ? err : warn)(f, where, `計画の中だけの言葉「${term}」。初見の人に分かる言い方にする`);
  }
  for (const w of FEELING) {
    if (text.includes(w)) warn(f, where, `気持ちの語「${w}」。書き手.md にある気持ちか確かめる`);
  }
  for (const [re, label] of IDENTITY) {
    const m = text.match(re);
    // 「40歳から」のような制度の年齢は書いてよいので、年齢は警告にとどめる
    if (m) (label === '年齢' ? warn : err)(f, where, `${label}が分かる「${m[0]}」。制度の年齢でなければ消す`);
  }
}

// ---------- 投稿文書 ----------
function checkPostDoc(file) {
  const f = basename(file);
  const pr = prSlugs();
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  let day = '';
  let slot = null; // '1つ目' など
  let section = '';
  const threads = []; // {day, posts: {1:..,2:..,3:..}}
  let cur = null;
  for (const raw of lines) {
    const line = raw.trim();
    const h1 = line.match(/^#\s+(\d+月\d+日.*)/);
    if (h1) { day = h1[1]; section = ''; slot = null; continue; }
    const h2 = line.match(/^##\s+(.*)/);
    if (h2) {
      section = h2[1]; slot = null;
      if (section.startsWith('X')) { cur = { day, posts: {} }; threads.push(cur); }
      continue;
    }
    if (/^-{3,}$/.test(line)) { slot = null; section = ''; continue; }
    const s = line.match(/^([123])つ目$/);
    if (s && section.startsWith('X')) { slot = s[1]; continue; }
    if (slot && line && cur) {
      cur.posts[slot] = (cur.posts[slot] ? cur.posts[slot] + ' ' : '') + line.replace(/\\#/g, '#');
    }
  }
  for (const t of threads) {
    const where = t.day.replace(/（.*/, '');
    const n = Object.keys(t.posts).length;
    if (n !== 3) err(f, where, `スレッドが${n}投稿。3投稿にする（ルール8）`);
    for (const [k, body] of Object.entries(t.posts)) {
      const w = `${where} ${k}つ目`;
      const counted = body.replace(/<?https?:\/\/\S+?>?(?=\s|$)/g, 'x'.repeat(23));
      if ([...counted].length > 140) err(f, w, `${[...counted].length}字。140字以内にする（ルール9）`);
      const plain = body.replace(/<?https?:\/\/\S+>?/g, '').replace(/#\S+/g, '').replace(/\(S\\?&P500\)/g, ''); // 銘柄名のカッコは除く
      if (/[（(]/.test(plain)) err(f, w, 'カッコ書きがある。文の中に入れる（ルール13）');
      commonChecks(f, w, plain, { isPost: true });
      for (const sentence of plain.split('。')) {
        if (NEGATIVE_END.test(sentence.trim() + '。')) warn(f, w, `否定で終わる文「${sentence.trim().slice(-15)}」。読者が得るものを先に書く`);
      }
    }
    const p1 = t.posts['1'] || '';
    const p3 = t.posts['3'] || '';
    if (/^私[はの]/.test(p1)) err(f, `${where} 1つ目`, '「私は／私の」で始まっている（ルール11）');
    const tags = (p1.match(/#\S+/g) || []).filter((x) => x !== '#PR');
    if (tags.length < 1 || tags.length > 2) err(f, `${where} 1つ目`, `タグが${tags.length}個。#PR以外で1〜2個（ルール8）`);
    const url = p3.match(/tatamu-hojin\.com\/posts\/([\w-]+)/);
    if (!url) err(f, `${where} 3つ目`, '記事のURLがない（ルール8）');
    else {
      const isPr = pr.has(url[1]);
      if (!existsSync(join(POSTS_DIR, url[1] + '.mdx'))) err(f, `${where} 3つ目`, `記事 ${url[1]} が見つからない`);
      if (isPr && !p1.includes('#PR')) err(f, `${where} 1つ目`, `誘導先 ${url[1]} は広告入り。#PR を付ける`);
      if (!isPr && p1.includes('#PR')) err(f, `${where} 1つ目`, `誘導先 ${url[1]} は広告なし。#PR を外す`);
    }
  }
  return threads.length;
}

// ---------- 記事 ----------
function checkArticle(file) {
  const f = basename(file);
  let t = readFileSync(file, 'utf8');
  t = t.replace(/^---[\s\S]*?\n---\n/, ''); // frontmatter
  const lines = t.split(/\r?\n/);
  let inCode = false;
  lines.forEach((raw, i) => {
    const where = `${i + 1}行`;
    if (raw.trim().startsWith('```')) { inCode = !inCode; return; }
    if (inCode) return;
    let line = raw
      .replace(/<[^>]+>/g, '')            // コンポーネント・タグ
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // リンクは文字だけ
      .replace(/^\s*(#+|[-*]|\d+\.|>|\|)\s*/, '')
      .trim();
    if (!line || line.startsWith('import ')) return;
    if (/^\|?\s*:?-+/.test(line)) return; // 表の区切り
    if (/[（(]/.test(line) && !raw.includes('|')) warn(f, where, 'カッコ書き。文の中に入れられないか見る');
    commonChecks(f, where, line, { isPost: false });
    if (raw.includes('|')) return; // 表の中は文の長さを見ない
    for (const s of line.split(/(?<=[。！？])/)) {
      const len = [...s.trim()].length;
      if (len > 60) warn(f, where, `${len}字の文。60字を超える文は分ける（C3）「${s.trim().slice(0, 20)}…」`);
    }
  });
}

const files = process.argv.slice(2);
if (!files.length) {
  console.log('使い方：node scripts/check.mjs <投稿文書.md や 記事.mdx ...>');
  process.exit(2);
}
for (const file of files) {
  if (file.endsWith('.mdx')) checkArticle(file);
  else {
    const n = checkPostDoc(file);
    if (n === 0) warn(basename(file), '', 'X のスレッドが見つからない。見出しの形を確かめる');
  }
}
for (const e of errors) console.log(e);
for (const w of warns) console.log(w);
console.log(`\nエラー ${errors.length}件・警告 ${warns.length}件`);
process.exit(errors.length ? 1 : 0);
