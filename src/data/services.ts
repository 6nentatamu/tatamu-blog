// 「使ったサービス一覧」とサイドバーのデータ。
// affiliateUrl / bannerHtml は ASP の提携が通ったら入れる（空なら公式サイトへの通常リンク）。

export type Service = {
	name: string;
	group: string;
	use: string; // 何に使ったか（n=1）
	officialUrl: string;
	post?: string; // 詳しい記事の slug
	affiliateUrl?: string;
	bannerHtml?: string; // ASP が出すバナーのHTMLをそのまま
};

export const SERVICES: Service[] = [
	{
		name: '三井住友銀行 Trunk',
		group: '銀行',
		use: '法人のメイン口座。売上の入金、給与振込、社会保険料の引き落とし',
		officialUrl: 'https://www.smbc.co.jp/hojin/kouza/special/concept/',
	},
	{
		name: 'ドコモSMTBネット銀行',
		group: '銀行',
		use: '法人の資金の置き場所。Trunk の残高を補充する元',
		officialUrl: 'https://www.netbk.co.jp/contents/hojin/',
	},
	{
		name: '三井住友カード ビジネスオーナーズ',
		group: 'カード',
		use: '経費の支払い（サブスクなど）。引き落としは Trunk',
		officialUrl: 'https://www.smbc-card.com/camp/biz_owners/index.html',
	},
	{
		name: 'リーガルスクリプト',
		group: '設立',
		use: '電子定款の作成（印紙代4万円がかからない）',
		officialUrl: 'https://legal-script.com/',
	},
	{
		name: '全力会計・全力電子帳簿',
		group: '会計・税務',
		use: '帳簿づけと電子帳簿保存',
		officialUrl: 'https://accounting.japanex.jp/',
	},
	{
		name: '全力法人税',
		group: '会計・税務',
		use: '法人税の申告書の作成',
		officialUrl: 'https://japanex.jp/',
	},
];
