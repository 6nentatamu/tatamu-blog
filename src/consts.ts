// サイト全体の設定。公開前に【要記入】を埋める。

export const SITE_TITLE = '6年でたたむひとり法人';
export const SITE_DESCRIPTION =
	'適応障害で退職した会社員が、解散日まで決めてマイクロ法人を作った記録。設立費用・役員報酬・社会保険・解散の税務を実数で書きます。';

// 【要記入】仮決めのペンネーム
export const AUTHOR = 'ひとり社長M';

// 【要記入】X のプロフィールURL。空のあいだはリンクを出さない
export const X_URL = 'https://x.com/hitori_shacho_m';

// 公開するまで true。検索エンジンに載せない（noindex）
export const NOINDEX = true;

// お問い合わせ用 Google フォームの共有URL（例: 'https://forms.gle/XXXX'）。空のあいだは「準備中」と表示
export const CONTACT_FORM_URL = 'https://forms.gle/htr6zHkPnBw14to88';

// 6年ゲージ。今が何年目か（年が変わったら手で1つ進める）。記事の「この記事は○年目に書きました」もこれを使う。
// 日・月・年月は出さない（品質基準 D1）。月次記事は frontmatter の year があればそちらを優先する。
export const TOTAL_YEARS = 6;
export const CURRENT_YEAR = 1;
