// 記事ごとのアイキャッチ（1200x630）。SVG を組み立てて sharp で PNG にする。
// 2026-10-18 専門家会議（アートディレクター・SNS運用・文字組み・ブランド）と実例確認で決めた形：
// 白地＋左の深緑の細い帯だけ。タイトルを太いゴシックで主役にし、強弱は文字の大きさで付ける。
// 方眼・左の太帯・6マスの目盛り・珊瑚の縦線・明朝・数字の枠はやめた（縮小時に埋もれるため）。
import sharp from 'sharp';

const FONT = "'Yu Gothic UI','Yu Gothic','Meiryo','Hiragino Sans','Noto Sans JP',sans-serif";
const INK = '#1c2421';
const MUTED = '#59645f';
const GREEN = '#0f5c4d';

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
const NO_HEAD = '、。，．・：；）」』！？ー…%％ぁぃぅぇぉっゃゅょァィゥェォッャュョ';
const PARTICLE = 'はをでにがのともへや';
const cw = (ch: string) => (/[A-Z]/.test(ch) ? 0.7 : /[ -~]/.test(ch) ? 0.55 : 1);
const width = (s: string) => [...s].reduce((a, c) => a + cw(c), 0);
const isHira = (c: string) => /[ぁ-ゖ]/.test(c);

// t の直後で切るときの良さ（小さいほど良い）。助詞の後・句読点の後・ひらがな→漢字/カタカナの境目を好む
function breakCost(t: string, next?: string) {
	if (!next || NO_HEAD.includes(next[0])) return Infinity;
	const last = t[t.length - 1];
	if ('、？！）」 '.includes(last)) return 0;
	if (next[0] === ' ') return Infinity;
	if (PARTICLE.includes(last)) return isHira(next[0]) ? 2 : 0;
	if (isHira(last) && !isHira(next[0])) return 1;
	if (/[ァ-ヶー]/.test(last) && /[ァ-ヶー]/.test(next[0])) return Infinity;
	if (!isHira(last) && !isHira(next[0])) return 5;
	return Infinity;
}

// 1区切りを n 行に分け、行の長さをそろえる。最終行が3字未満にならないようにする
function balance(text: string, max: number): string[] {
	const tokens = text.match(TOKEN) ?? [];
	const total = width(text);
	if (total <= max) return [text];
	for (let n = Math.ceil(total / max); n <= 4; n++) {
		const target = total / n;
		// 動的計画法：dp[i][k] = tokens[0..i) を k 行にしたときの最小コスト
		const N = tokens.length;
		const pre = [0];
		for (const t of tokens) pre.push(pre[pre.length - 1] + width(t));
		const dp = Array.from({ length: N + 1 }, () => Array(n + 1).fill(Infinity));
		const back = Array.from({ length: N + 1 }, () => Array(n + 1).fill(-1));
		dp[0][0] = 0;
		for (let i = 1; i <= N; i++)
			for (let k = 1; k <= n; k++)
				for (let j = k - 1; j < i; j++) {
					if (dp[j][k - 1] === Infinity) continue;
					const w = pre[i] - pre[j];
					if (w > max || w < 3) continue;
					const bc = i === N ? 0 : breakCost(tokens[i - 1], tokens[i]);
					if (bc === Infinity) continue;
					const c = dp[j][k - 1] + (w - target) ** 2 + bc * 4;
					if (c < dp[i][k]) {
						dp[i][k] = c;
						back[i][k] = j;
					}
				}
		if (dp[N][n] === Infinity) continue;
		const lines: string[] = [];
		let i = N;
		for (let k = n; k > 0; k--) {
			const j = back[i][k];
			lines.unshift(tokens.slice(j, i).join(''));
			i = j;
		}
		return lines;
	}
	return [text];
}

// 「：」「？」で必ず改行し（記号は前の行に残す）、それぞれを行の長さをそろえて折り返す
export function titleLines(title: string, max = 15): string[] {
	return title.split(/(?<=[：:？?])/).flatMap((p) => balance(p.trim(), max));
}

export function ogSvg(opts: OgOpts) {
	const kn = opts.keyNumber;
	const prequel = opts.categoryId === 'prequel';
	let lines = titleLines(opts.title, 15);
	let size = 68;
	if (lines.length > 3) {
		lines = titleLines(opts.title, 17);
		size = 60;
	}
	if (lines.length === 3) size = Math.min(size, kn ? 58 : 64);
	const lh = Math.round(size * 1.35);
	const blockH = lh * (lines.length - 1) + size;
	// 数字があるときはタイトルを上に寄せ、ないときは上下の中央に置く
	const top = kn ? (lines.length === 3 ? 140 : 175) : 150 + (400 - blockH) / 2;
	const label = opts.partNo !== undefined ? `第${opts.partNo}部　${opts.part}` : opts.part;
	const yearText = prequel ? '設立前' : `${opts.year}年目`;
	const knValueSize = [...(kn?.value ?? '')].length > 9 ? 72 : 88;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#ffffff"/>
<rect width="16" height="630" fill="${GREEN}"/>
<text x="80" y="104" font-family="${FONT}" font-size="30" font-weight="700" fill="${GREEN}">${esc(label)}<tspan dx="24" font-weight="400">${yearText}</tspan></text>
<text x="1036" y="100" text-anchor="end" font-family="${FONT}" font-size="24" font-weight="700" fill="${MUTED}">6年でたたむマイクロ法人</text>
<svg x="1052" y="58" width="68" height="58" viewBox="105 72 190 146"><polygon points="105,72 295,72 295,218 105,218" fill="#fffdf8" stroke="${GREEN}" stroke-width="8"/><polygon points="105,72 295,72 295,96 105,96" fill="${GREEN}"/><circle cx="158" cy="143" r="16" fill="#1b1b1b"/><circle cx="242" cy="143" r="16" fill="#1b1b1b"/><circle cx="126" cy="178" r="13" fill="#ff6b4a" opacity=".5"/><circle cx="274" cy="178" r="13" fill="#ff6b4a" opacity=".5"/><path d="M184 176 Q200 192 216 176" fill="none" stroke="#1b1b1b" stroke-width="6" stroke-linecap="round"/></svg>
${lines
	.map(
		(l, i) =>
			`<text x="80" y="${top + size + i * lh}" font-family="${FONT}" font-size="${size}" font-weight="700" letter-spacing="-1" fill="${INK}">${esc(l)}</text>`,
	)
	.join('\n')}
${
	kn
		? `<text x="80" y="488" font-family="${FONT}" font-size="26" fill="${MUTED}">${esc(kn.label)}</text>
<text x="76" y="${488 + 18 + knValueSize}" font-family="${FONT}" font-size="${knValueSize}" font-weight="700" fill="${GREEN}">${esc(kn.value)}</text>`
		: ''
}
</svg>`;
}

export async function ogPng(opts: OgOpts) {
	return sharp(Buffer.from(ogSvg(opts))).png().toBuffer();
}
