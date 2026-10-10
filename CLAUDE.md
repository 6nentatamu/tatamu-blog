# 6年でたたむひとり法人（Astro）— 作業ルール

- 記事は `src/content/posts/` に `.md` / `.mdx` で置く
- frontmatter: `title`, `description`, `pubDate`, `updatedDate?`, `category`（prequel|concept|design|setup|operation|monthly）, `order?`（部内の並び順）, `tags[]`, `pr`（アフィリエイトありなら true＝冒頭にPR表記）, `draft`（true は本番ビルドに出ない）
- アフィリエイトは MDX 内で `<AffLink>` / `<AffBanner>` を使う（import 不要）。サービス情報は `src/data/services.ts`
- AdSenseは使わない（既存サイトと運営者IDで結び付くため）
- 公開前は `src/consts.ts` の `NOINDEX = true`、`astro.config.mjs` の site は example.com のまま
- 匿名ルール：勤務先・業種・地域・具体的な日付・会社名・口座番号を書かない。病名は「適応障害」まで可
- 写真は使わない
- 変更後は `npm run build` で確認する

## 記事を書くとき（必須）
記事の執筆・改稿は必ず `.claude/skills/write-article/SKILL.md` の手順で行う。品質基準は `editorial/品質基準.md`、素材の場所は `editorial/素材マップ.md`、本人の体験は `editorial/取材メモ_*.md`。本人に見せるのは品質基準に全項目合格した記事だけ。

## サブエージェントのモデル（2026-10-11 本人指示）
単純作業は Haiku（`simple-worker`）、手順の決まった中程度の作業（事実確認・実装・文体調整・査読）は Sonnet（`standard-worker`）に任せる。定義は `.claude/agents/`。企画・方針判断・最終確認はメインで行う。
