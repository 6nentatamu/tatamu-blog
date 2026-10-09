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
		// true のあいだは本番ビルドに出さない
		draft: z.boolean().default(false),
	}),
});

export const collections = { posts };
