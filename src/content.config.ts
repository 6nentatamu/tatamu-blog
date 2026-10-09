import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORY_IDS } from './data/categories';

const posts = defineCollection({
	loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		// 連載の部（＝カテゴリ）
		category: z.enum(CATEGORY_IDS),
		// 部の中での並び順（連載の前後リンクに使う）
		order: z.number().optional(),
		tags: z.array(z.string()).default([]),
		// アフィリエイトを含む記事は true（冒頭にPR表記が出る）
		// 冒頭の「この記事の結論」ボックス（3行以内）
		summary: z.string().optional(),
		pr: z.boolean().default(false),
		// 「この記事の数字」カード（最大3つ）。記事冒頭に大きく出す。最初の1つはアイキャッチにも載る
		keyNumbers: z
			.array(z.object({ label: z.string(), value: z.string(), note: z.string().optional() }))
			.max(3)
			.optional(),
		// 出典（記事末の「出典・制度の時点」欄）
		sources: z.array(z.object({ title: z.string(), url: z.string().url() })).optional(),
		// 制度の時点（例「2026年10月時点の制度」）
		asOf: z.string().optional(),
		// 何年目に書いたか（1〜6）。省略時は consts.ts の CURRENT_YEAR
		year: z.number().int().min(1).max(6).optional(),
		// true のあいだは本番ビルドに出さない
		draft: z.boolean().default(false),
	}),
});

export const collections = { posts };
