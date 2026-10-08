// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// 【要記入】ドメインが決まったら site を本番URLにする
export default defineConfig({
	site: 'https://example.com',
	trailingSlash: 'always',
	integrations: [mdx(), sitemap()],
});
