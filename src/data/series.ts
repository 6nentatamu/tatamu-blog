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
		{ title: '役員報酬をいくらにしたか' },
		{ title: '法人の資金計画：資本金100万＋役員借入金200万' },
		{ title: 'モンテカルロで下振れに耐えるか確かめた' },
		{ title: '終わり方から逆算する：解散の税務と健康保険' },
		{ title: '却下した案の記録' },
		{ title: 'いつ設立するか（創業支援を受けなかった理由）' },
	],
	setup: [
		{ title: '設立の全手順と費用' },
		{ title: '法人口座の審査対策' },
		{ title: '本店をどこに置くか' },
		{ title: '法人カードと証券口座' },
		{ title: '法人口座と個人口座の組み合わせ方' },
		{ title: '会計・給与ソフトの選び方' },
		{ title: 'つまずいた点とやり直し' },
	],
	operation: [
		{ title: '毎月の経理ルーチン' },
		{ title: 'まとめ：マイクロ法人は得だったか' },
	],
};
