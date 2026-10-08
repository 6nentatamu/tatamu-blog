# 6年でたたむひとり法人（Astro）— 作業ルール

- 記事は `src/content/posts/` に `.md` / `.mdx` で置く
- frontmatter: `title`, `description`, `pubDate`, `updatedDate?`, `category`（prequel|concept|design|setup|operation|monthly）, `order?`（部内の並び順）, `tags[]`, `pr`（アフィリエイトありなら true＝冒頭にPR表記）, `draft`（true は本番ビルドに出ない）
- アフィリエイトは MDX 内で `<AffLink>` / `<AffBanner>` を使う（import 不要）。サービス情報は `src/data/services.ts`
- AdSenseは使わない（既存サイトと運営者IDで結び付くため）
- 公開前は `src/consts.ts` の `NOINDEX = true`、`astro.config.mjs` の site は example.com のまま
- 匿名ルール：勤務先・業種・地域・具体的な日付・会社名・口座番号を書かない。病名は「適応障害」まで可
- 写真は使わない
- 変更後は `npm run build` で確認する
