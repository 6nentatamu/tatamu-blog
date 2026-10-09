// 記事ごとのアイキャッチ（1200x630）。SVG を組み立てて sharp で PNG にする。
// 左帯に6年ゲージと「○年目」。部ごとに帯の色とモチーフを変える。前日譚は朱を使わない。
// keyNumber があれば右下に大きく出す。
import sharp from 'sharp';

const FONT = "'Yu Gothic UI','Yu Gothic','Meiryo','Hiragino Sans','Noto Sans JP',sans-serif";
const MINCHO = "'Yu Mincho','Hiragino Mincho ProN','Noto Serif JP',serif";
const BG = '#faf8f4';
const INK = '#26231f';
const DEADLINE = '#c8553d';

// 部ごとの帯色とモチーフ
const THEME: Record<string, { color: string; motif: 'dots' | 'lines' | 'grid' | 'steps' | 'rings' | 'ticks' }> = {
	prequel: { color: '#55657f', motif: 'dots' },
	concept: { color: '#1f6f6a', motif: 'lines' },
	design: { color: '#2d5873', motif: 'grid' },
	setup: { color: '#7a5a2a', motif: 'steps' },
	operation: { color: '#4b6a3b', motif: 'rings' },
	monthly: { color: INK, motif: 'ticks' },
};

function motifSvg(m: string) {
	const out: string[] = [];
	const o = 'stroke="#fff" stroke-opacity=".14" fill="none"';
	if (m === 'dots') for (let x = 0; x < 6; x++) for (let y = 0; y < 4; y++) out.push(`<circle cx="${36 + x * 38}" cy="${440 + y * 38}" r="4" fill="#fff" fill-opacity=".16"/>`);
	if (m === 'lines') for (let i = 0; i < 9; i++) out.push(`<line x1="${-40 + i * 40}" y1="630" x2="${120 + i * 40}" y2="420" ${o} stroke-width="2"/>`);
	if (m === 'grid') for (let i = 0; i < 7; i++) out.push(`<line x1="${20 + i * 38}" y1="420" x2="${20 + i * 38}" y2="610" ${o} stroke-width="2"/><line x1="0" y1="${420 + i * 32}" x2="260" y2="${420 + i * 32}" ${o} stroke-width="2"/>`);
	if (m === 'steps') out.push(`<path d="M0 610 h50 v-40 h50 v-40 h50 v-40 h50 v-40 h60" ${o} stroke-width="4"/>`);
	if (m === 'rings') for (let i = 1; i < 6; i++) out.push(`<circle cx="130" cy="560" r="${i * 26}" ${o} stroke-width="2"/>`);
	if (m === 'ticks') for (let i = 0; i < 12; i++) out.push(`<line x1="${22 + i * 19}" y1="${i % 3 === 0 ? 560 : 580}" x2="${22 + i * 19}" y2="610" ${o} stroke-width="3"/>`);
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

// 全角を1、半角を0.55として幅を数え、max を超えたら折り返す。行頭に句読点を置かない。
function wrap(text: string, max: number): string[] {
	const lines: string[] = [];
	let cur = '';
	let w = 0;
	const noHead = '、。，．・：；）」』！？ー…';
	for (const ch of text) {
		const cw = /[\x20-\x7e]/.test(ch) ? 0.55 : 1;
		if (w + cw > max && cur && !noHead.includes(ch)) {
			lines.push(cur);
			cur = '';
			w = 0;
		}
		cur += ch;
		w += cw;
	}
	if (cur) lines.push(cur);
	return lines;
}

// タイトルの「：」で区切れるなら、そこで改行する
function titleLines(title: string, max = 17): string[] {
	const parts = title.split(/(?<=[：:、])/);
	return parts.flatMap((p) => wrap(p, max));
}

export function ogSvg(opts: OgOpts) {
	const theme = THEME[opts.categoryId] ?? THEME.concept;
	const calm = opts.categoryId === 'prequel';
	const nowColor = calm ? '#ffffff' : DEADLINE;
	const kn = opts.keyNumber;
	const maxLines = kn ? 3 : 4;
	const lines = titleLines(opts.title, 15).slice(0, maxLines);
	const size = lines.length >= 3 ? 50 : 58;
	const lh = size * 1.4;
	const titleTop = 205 + size;
	const label = opts.partNo !== undefined ? `第${opts.partNo}部　${opts.part}` : opts.part;
	const labelW = [...label].length * 28 + 44;
	// 左帯のゲージ：6コマ（経過＝白塗り、今年＝朱〔前日譚は白〕、残り＝線）
	const cells = Array.from({ length: 6 }, (_, i) => {
		const y = i + 1;
		const x = 38 + i * 32;
		if (y < opts.year) return `<rect x="${x}" y="230" width="24" height="70" fill="#fff"/>`;
		if (y === opts.year)
			return `<rect x="${x}" y="230" width="24" height="70" fill="${nowColor}"${calm ? '' : ' stroke="#fff" stroke-width="2"'}/>`;
		return `<rect x="${x + 1.5}" y="231.5" width="21" height="67" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3"/>`;
	}).join('');
	const knSvg = kn
		? `<text x="310" y="505" font-family="${FONT}" font-size="26" fill="#6b655c">${esc(kn.label)}</text>
<text x="310" y="575" font-family="${FONT}" font-size="${[...kn.value].length > 12 ? 52 : 66}" font-weight="700" fill="${theme.color}">${esc(kn.value)}</text>`
		: '';
	return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="${BG}"/>
<rect width="260" height="630" fill="${theme.color}"/>
${motifSvg(theme.motif)}
<text x="38" y="80" font-family="${MINCHO}" font-size="25" font-weight="700" fill="#fff">6年でたたむ</text>
<text x="38" y="114" font-family="${MINCHO}" font-size="25" font-weight="700" fill="#fff">ひとり法人</text>
<text x="38" y="200" font-family="${FONT}" font-size="22" fill="#fff" fill-opacity=".85">6年のうち</text>
${cells}
<text x="38" y="370" font-family="${FONT}" font-size="54" font-weight="700" fill="#fff">${opts.year}<tspan font-size="30">年目</tspan></text>
<rect x="310" y="70" width="${labelW}" height="50" rx="25" fill="${theme.color}"/>
<text x="${310 + labelW / 2}" y="105" text-anchor="middle" font-family="${FONT}" font-size="26" font-weight="700" fill="#fff">${esc(label)}</text>
${lines
	.map(
		(l, i) =>
			`<text x="310" y="${titleTop + i * lh - (kn ? 30 : 0)}" font-family="${FONT}" font-size="${size}" font-weight="700" fill="${INK}">${esc(l)}</text>`,
	)
	.join('\n')}
${knSvg}
</svg>`;
}

export async function ogPng(opts: OgOpts) {
	return sharp(Buffer.from(ogSvg(opts))).png().toBuffer();
}
