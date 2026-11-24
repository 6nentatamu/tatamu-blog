// 連載目次に出す予定の記事。公開済みの記事は slug を入れるとリンクになる。
// 正は企画書（Claude Docs「マイクロ法人設立記事 企画書」）の記事構成。

import type { CategoryId } from './categories';

export type PlannedPost = { title: string; slug?: string };

export const SERIES: Partial<Record<CategoryId, PlannedPost[]>> = {
	// 前日譚は全5本公開済み（2026-10）
	concept: [
		{ title: 'なぜ法人を考えたか（国保・年金の負担）' },
		{ title: '個人・法人・その他の3パターン比較' },
	],
	design: [
		{ title: 'いくら得か：投資利益別の感度分析' },
		{ title: '役員報酬をいくらにしたか', slug: 'design-1-houshu' },
		{ title: '法人の資金計画：資本金100万＋役員借入金200万', slug: 'design-2-shihonkin' },
		{ title: 'モンテカルロで下振れに耐えるか確かめた' },
		{ title: '終わり方から逆算する：解散の税務と健康保険' },
		{ title: '役員報酬の支給日と社会保険料の当月控除', slug: 'design-8-shikyubi' },
		{ title: '小規模企業共済に入らずiDeCoにした理由', slug: 'design-9-kyosai' },
		{ title: '却下した案の記録' },
		{ title: 'いつ設立するか（創業支援を受けなかった理由）' },
	],
	setup: [
		{ title: '設立の全手順と費用', slug: 'setup-1-hiyou' },
		{ title: '法人の銀行口座：3行に同時に申し込んだ', slug: 'setup-7-ginkou' },
		{ title: '本店をどこに置くか', slug: 'setup-4-honten' },
		{ title: '法人の証券口座の開き方', slug: 'setup-5-shoken' },
		{ title: '法人カード' },
		{ title: '法人口座と個人口座の組み合わせ方' },
		{ title: '会計・給与ソフトの選び方', slug: 'setup-2-kaikei' },
		{ title: '申告を税理士に頼むか', slug: 'setup-6-zeirishi' },
		{ title: 'つまずいた点とやり直し' },
	],
	operation: [
		{ title: '旅費規程と車両借上規程', slug: 'operation-1-ryohi' },
		{ title: '役員の業務記録を作らない理由', slug: 'operation-2-jittai' },
		{ title: '書類の保存と電子帳簿保存法', slug: 'operation-3-hozon' },
		{ title: '毎月の経理ルーチン' },
		{ title: 'まとめ：マイクロ法人は得だったか' },
	],
};
