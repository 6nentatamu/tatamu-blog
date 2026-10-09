// 記事ごとのアイキャッチ（1200x630）。SVG を組み立てて sharp で PNG にする。
// B案のロゴ（6本の目盛り）をモチーフに、部の名前とタイトルを入れる。
import sharp from 'sharp';

const FONT = "'Yu Gothic UI','Yu Gothic','Meiryo','Hiragino Sans','Noto Sans JP',sans-serif";
const ACCENT = '#1f6f6a';

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
function titleLines(title: string): string[] {
	const parts = title.split(/(?<=[：:、])/);
	return parts.flatMap((p) => wrap(p, 17));
}

export function ogSvg(opts: { title: string; part: string; partNo?: number }) {
	const lines = titleLines(opts.title).slice(0, 4);
	const size = lines.length >= 4 ? 54 : 62;
	const lh = size * 1.38;
	const top = 270 - ((lines.length - 1) * lh) / 2 + 40;
	const label = opts.partNo !== undefined ? `第${opts.partNo}部　${opts.part}` : opts.part;
	const labelW = [...label].length * 30 + 48;
	// 目盛り：6本。第1期（1本目）だけ色を付ける
	const bars = Array.from({ length: 6 }, (_, i) => {
		const x = 900 + i * 34;
		return i === 0
			? `<rect x="${x}" y="530" width="24" height="44" fill="${ACCENT}"/>`
			: `<rect x="${x + 1.5}" y="531.5" width="21" height="41" fill="none" stroke="#111" stroke-width="3" opacity=".3"/>`;
	}).join('');
	return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#f3f8f7"/>
<rect x="40" y="40" width="1120" height="550" rx="20" fill="#fff"/>
<rect x="40" y="40" width="14" height="550" fill="${ACCENT}"/>
<rect x="100" y="86" width="${labelW}" height="54" rx="27" fill="${ACCENT}"/>
<text x="${100 + labelW / 2}" y="123" text-anchor="middle" font-family="${FONT}" font-size="28" font-weight="700" fill="#fff">${esc(label)}</text>
${lines
	.map(
		(l, i) =>
			`<text x="100" y="${top + i * lh}" font-family="${FONT}" font-size="${size}" font-weight="700" fill="#111">${esc(l)}</text>`,
	)
	.join('\n')}
<line x1="100" y1="500" x2="1100" y2="500" stroke="#e3e5e8" stroke-width="2"/>
<text x="100" y="568" font-family="${FONT}" font-size="30" font-weight="700" fill="${ACCENT}">6年でたたむひとり法人</text>
${bars}
</svg>`;
}

export async function ogPng(opts: { title: string; part: string; partNo?: number }) {
	return sharp(Buffer.from(ogSvg(opts))).png().toBuffer();
}
