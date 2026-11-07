// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { readdirSync, readFileSync } from 'node:fs';

// 記事が2本以下のタグページと「使ったサービス一覧」はサイトマップに入れない（ページ側は noindex。src/consts.ts の THIN_TAG_MAX と同じ数）
const THIN_TAG_MAX = 2;
const tagCount = {};
for (const f of readdirSync('src/content/posts').filter((f) => /\.mdx?$/.test(f))) {
	const fm = readFileSync(`src/content/posts/${f}`, 'utf-8').split(/^---$/m)[1] ?? '';
	if (/^draft:\s*true/m.test(fm)) continue;
	const m = fm.match(/^tags:\s*\[(.*)\]/m);
	for (const t of m ? m[1].split(',').map((x) => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean) : []) {
		tagCount[t] = (tagCount[t] ?? 0) + 1;
	}
}
const excluded = new Set([
	'/services/',
	...Object.entries(tagCount).filter(([, n]) => n <= THIN_TAG_MAX).map(([t]) => `/tags/${t}/`),
]);

// 本番URL（ドメインは 2026-10-06 決定。取得は Cloudflare で後日）
export default defineConfig({
	site: 'https://tatamu-hojin.com',
	trailingSlash: 'always',
	integrations: [mdx(), sitemap({
			filter: (page) => !page.includes('/preview/') && !excluded.has(decodeURIComponent(new URL(page).pathname)),
		})],
});
