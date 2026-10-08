// カテゴリ＝連載の部。並び順はこの配列の順。

export const CATEGORIES = [
	{ id: 'prequel', name: '前日譚', lead: '適応障害で休職し、退職して、法人を作ると決めるまで' },
	{ id: 'concept', name: '構想', lead: 'なぜ法人を考えたか。個人のままとの比較' },
	{ id: 'design', name: '設計', lead: '役員報酬・資金計画・解散まで、作る前に決めたこと' },
	{ id: 'setup', name: '設立', lead: '設立の手順と費用、銀行口座、カード、会計ソフト' },
	{ id: 'operation', name: '運用', lead: '設立後の経理、決算、毎年の手続き' },
	{ id: 'monthly', name: '月次収支', lead: '法人とブログの収支を毎月そのまま公開' },
] as const;

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as unknown as [
	(typeof CATEGORIES)[number]['id'],
	...(typeof CATEGORIES)[number]['id'][],
];

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export function categoryOf(id: CategoryId) {
	return CATEGORIES.find((c) => c.id === id)!;
}
