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
		post: 'setup-1-hiyou',
	},
	{
		name: 'ドコモSMTBネット銀行',
		group: '銀行',
		use: '法人の資金の置き場所。Trunk の残高を補充する元',
		officialUrl: 'https://www.netbk.co.jp/contents/hojin/',
		post: 'setup-5-shoken',
	},
	{
		name: '三井住友カード ビジネスオーナーズ',
		group: 'カード',
		use: '経費の支払い（サブスクなど）。引き落としは Trunk',
		officialUrl: 'https://www.smbc-card.com/camp/biz_owners/index.html',
		post: 'setup-1-hiyou',
	},
	{
		name: '弥生のかんたん会社設立',
		group: '設立',
		use: '設立書類の作成と電子定款（印紙代4万円がかからない）',
		officialUrl: 'https://www.yayoi-kk.co.jp/services/kigyo/setsuritsu/',
		post: 'setup-1-hiyou',
		affiliateUrl: 'https://px.a8.net/svt/ejp?a8mat=4BEHXA+BT3IPE+35XE+HXSGI',
	},
	{
		name: '全力会計・全力電子帳簿',
		group: '会計・税務',
		use: '帳簿づけと電子帳簿保存',
		officialUrl: 'https://accounting.japanex.jp/',
		post: 'setup-2-kaikei',
	},
	{
		name: '全力法人税',
		group: '会計・税務',
		use: '法人税の申告書の作成',
		officialUrl: 'https://japanex.jp/',
		post: 'setup-2-kaikei',
	},
	{
		name: 'フリーウェイ給与計算',
		group: '会計・税務',
		use: '役員報酬の給与計算と年末調整。無料版で足りている',
		officialUrl: 'https://freeway-kyuuyo.net/',
		post: 'setup-2-kaikei',
	},
	{
		name: 'SBI証券（法人口座）',
		group: '証券',
		use: '会社のお金を投資信託で運用する口座。売るときは買取請求',
		officialUrl: 'https://www.sbisec.co.jp/',
		post: 'setup-5-shoken',
	},
	{
		name: 'SBI証券のiDeCo',
		group: '証券',
		use: '個人のiDeCo。eMAXIS Slim 米国株式(S&P500) を積み立て',
		officialUrl: 'https://go.sbisec.co.jp/prd/ideco/',
		post: 'design-5-ideco',
	},
];
