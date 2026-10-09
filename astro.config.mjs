// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// 本番URL（ドメインは 2026-10-06 決定。取得は Cloudflare で後日）
export default defineConfig({
	site: 'https://tatamu-hojin.com',
	trailingSlash: 'always',
	integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/preview/') })],
});
