// 記事ごとのアイキャッチ（1200x630）。SVG を組み立てて sharp で PNG にする。
// 配色＝案2（深緑×珊瑚）、方向性＝C（手帳・記録ノート）。右は方眼の紙、左は部ごとの色の帯。
// 左帯に6年の目盛りと「○年目」。部ごとに帯の色とモチーフを変える。前日譚は「今年」の珊瑚を使わない。
// keyNumber があれば右下に集計表の1行として大きく出す。
import sharp from 'sharp';

const FONT = "'Yu Gothic UI','Yu Gothic','Meiryo','Hiragino Sans','Noto Sans JP',sans-serif";
// Zen Old Mincho はビルド環境（Windows の sharp/librsvg）に無いので、システムの游明朝を使う
const MINCHO = "'Zen Old Mincho','Yu Mincho','YuMincho','Hiragino Mincho ProN','Noto Serif JP',serif";
const PAPER = '#fff6e9';
const INK = '#1b1b1b';
const GREEN = '#0f5c4d';
const CORAL = '#ff6b4a';
const YELLOW = '#ffd166';

// 部ごとの帯色とモチーフ。色は案2の色相（深緑を軸に、青緑・墨緑・黄・墨）で分ける。
// fg＝帯の上の文字色、num＝紙の上に出す数字の色
type Theme = { color: string; fg: string; num: string; motif: 'dots' | 'lines' | 'grid' | 'steps' | 'rings' | 'ticks' };
const THEME: Record<string, Theme> = {
	prequel: { color: '#4f6f67', fg: '#fff', num: '#3d5952', motif: 'dots' },
	concept: { color: GREEN, fg: '#fff', num: GREEN, motif: 'lines' },
	design: { color: '#17697a', fg: '#fff', num: '#125563', motif: 'grid' },
	setup: { color: '#0a3d33', fg: '#fff', num: '#0a3d33', motif: 'steps' },
	operation: { color: YELLOW, fg: INK, num: '#7a5600', motif: 'rings' },
	monthly: { color: INK, fg: '#fff', num: GREEN, motif: 'ticks' },
};

function motifSvg(m: string, fg: string) {
	const out: string[] = [];
	const o = `stroke="${fg}" stroke-opacity=".14" fill="none"`;
	if (m === 'dots') for (let x = 0; x < 6; x++) for (let y = 0; y < 4; y++) out.push(`<circle cx="${36 + x * 38}" cy="${440 + y * 38}" r="4" fill="${fg}" fill-opacity=".16"/>`);
	if (m === 'lines') for (let i = 0; i < 9; i++) out.push(`<line x1="${-40 + i * 40}" y1="630" x2="${120 + i * 40}" y2="420" ${o} stroke-width="2"/>`);
	if (m === 'grid') for (let i = 0; i < 7; i++) out.push(`<line x1="${20 + i * 38}" y1="420" x2="${20 + i * 38}" y2="610" ${o} stroke-width="2"/><line x1="0" y1="${420 + i * 32}" x2="260" y2="${420 + i * 32}" ${o} stroke-width="2"/>`);
	if (m === 'steps') out.push(`<path d="M0 610 h50 v-40 h50 v-40 h50 v-40 h50 v-40 h60" ${o} stroke-width="4"/>`);
	if (m === 'rings') for (let i = 1; i < 6; i++) out.push(`<circle cx="130" cy="560" r="${i * 26}" ${o} stroke-width="2"/>`);
	if (m === 'ticks') for (let i = 0; i < 12; i++) out.push(`<line x1="${22 + i * 19}" y1="${i % 3 === 0 ? 560 : 580}" x2="${22 + i * 19}" y2="610" ${o} stroke-width="3"/>`);
	return out.join('');
}

// 紙の方眼（右側の地）
function gridSvg() {
	const out: string[] = [];
	const o = `stroke="${GREEN}" stroke-opacity=".08" stroke-width="1"`;
	for (let x = 280; x < 1200; x += 30) out.push(`<line x1="${x}" y1="0" x2="${x}" y2="630" ${o}/>`);
	for (let y = 15; y < 630; y += 30) out.push(`<line x1="260" y1="${y}" x2="1200" y2="${y}" ${o}/>`);
	return out.join('');
}

export type OgOpts = {
	title: string;
	part: string;
	partNo?: number;
	categoryId: string;
	year: number;
	keyNumber?: { label: string; value: string };
};

function esc(s: string) {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 数字＋単位（1.86万円、68,590円、1年6か月 など）や英単語を1語として扱う
const TOKEN = /[0-9０-９][0-9０-９,，.．]*(?:(?:[万千百億]?円|万|億|か月|ヶ月|カ月|年|月|日|時間|分|歳|%|％|人|回|件|割|倍|部|号|第)[0-9０-９,，.．]*)*|[A-Za-z]+|[\s\S]/gu;
const NO_HEAD = '、。，．・：；）」』！？ー…%％';
const cw = (ch: string) => (/[A-Z]/.test(ch) ? 0.7 : /[ -~]/.test(ch) ? 0.55 : 1);

// 全角を1、半角を0.55として幅を数え、max を超えたら語の前で折り返す。行頭に句読点を置かない。
function wrap(text: string, max: number): string[] {
	const tokens = text.match(TOKEN) ?? [];
	const lines: string[] = [];
	let cur = '';
	let w = 0;
	for (const t of tokens) {
		const tw = [...t].reduce((a, c) => a + cw(c), 0);
		if (w + tw > max && cur && !NO_HEAD.includes(t[0])) {
			lines.push(cur);
			cur = '';
			w = 0;
		}
		cur += t;
		w += tw;
	}
	if (cur) lines.push(cur);
	return lines;
}

// タイトルの「：」で区切れるなら、そこで改行する
function titleLines(title: string, max = 17): string[] {
	const parts = title.split(/(?<=[：:、？])/);
	return parts.flatMap((p) => wrap(p, max));
}

export function ogSvg(opts: OgOpts) {
	const theme = THEME[opts.categoryId] ?? THEME.concept;
	const calm = opts.categoryId === 'prequel';
	const fg = theme.fg;
	const kn = opts.keyNumber;
	const maxLines = kn ? 3 : 4;
	const lines = titleLines(opts.title, 15).slice(0, maxLines);
	const size = lines.length >= 3 ? 50 : 56;
	const lh = size * 1.4;
	const titleTop = 205 + size;
	const label = opts.partNo !== undefined ? `第${opts.partNo}部　${opts.part}` : opts.part;
	const labelW = [...label].length * 28 + 44;
	// 左帯の目盛り：6コマ（経過＝帯の文字色で塗り、今年＝珊瑚〔前日譚は使わない〕、残り＝線）
	const outline = (x: number) =>
		`<rect x="${x + 1.5}" y="231.5" width="21" height="67" fill="none" stroke="${fg}" stroke-opacity=".6" stroke-width="3"/>`;
	const cells = Array.from({ length: 6 }, (_, i) => {
		const y = i + 1;
		const x = 38 + i * 32;
		if (calm) return outline(x);
		if (y < opts.year) return `<rect x="${x}" y="230" width="24" height="70" fill="${fg}"/>`;
		if (y === opts.year) return `<rect x="${x}" y="230" width="24" height="70" fill="${CORAL}" stroke="${fg}" stroke-width="2"/>`;
		return outline(x);
	}).join('');
	// 数字は集計表の1行（上に深緑の二重線、下に罫線）
	const knSvg = kn
		? `<rect x="310" y="462" width="830" height="126" fill="#fffdf8"/>
<line x1="310" y1="462" x2="1140" y2="462" stroke="${GREEN}" stroke-width="4"/>
<line x1="310" y1="588" x2="1140" y2="588" stroke="${GREEN}" stroke-opacity=".35" stroke-width="2"/>
<line x1="322" y1="462" x2="322" y2="588" stroke="${CORAL}" stroke-width="2"/>
<text x="340" y="503" font-family="${FONT}" font-size="26" fill="#5f5a52">${esc(kn.label)}</text>
<text x="340" y="568" font-family="${FONT}" font-size="${[...kn.value].length > 12 ? 50 : 62}" font-weight="700" fill="${theme.num}">${esc(kn.value)}</text>`
		: '';
	return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="${PAPER}"/>
${gridSvg()}
<rect width="260" height="630" fill="${theme.color}"/>
<rect x="260" width="8" height="630" fill="${CORAL}"/>
${motifSvg(theme.motif, fg)}
<text x="38" y="80" font-family="${MINCHO}" font-size="25" font-weight="700" fill="${fg}">6年でたたむ</text>
<text x="38" y="114" font-family="${MINCHO}" font-size="25" font-weight="700" fill="${fg}">ひとり法人</text>
<text x="38" y="200" font-family="${FONT}" font-size="22" fill="${fg}" fill-opacity=".85">6年のうち</text>
${cells}
<text x="38" y="370" font-family="${FONT}" font-size="54" font-weight="700" fill="${fg}">${calm ? '設立前' : `${opts.year}<tspan font-size="30">年目</tspan>`}</text>
<rect x="310" y="70" width="${labelW}" height="50" rx="4" fill="${theme.color}"/>
<text x="${310 + labelW / 2}" y="105" text-anchor="middle" font-family="${FONT}" font-size="26" font-weight="700" fill="${fg}">${esc(label)}</text>
${lines
	.map(
		(l, i) =>
			`<text x="310" y="${titleTop + i * lh - (kn ? 30 : 0)}" font-family="${MINCHO}" font-size="${size}" font-weight="700" fill="${INK}">${esc(l)}</text>`,
	)
	.join('\n')}
${knSvg}
</svg>`;
}

export async function ogPng(opts: OgOpts) {
	return sharp(Buffer.from(ogSvg(opts))).png().toBuffer();
}
