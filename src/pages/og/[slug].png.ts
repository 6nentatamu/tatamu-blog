// 記事ごとのアイキャッチ画像（/og/<slug>.png）。ビルド時に生成する。
import type { APIRoute } from 'astro';
import { CATEGORIES, categoryOf } from '../../data/categories';
import { ogPng } from '../../lib/og';
import { getPosts } from '../../lib/posts';

export async function getStaticPaths() {
	const posts = await getPosts();
	return posts.map((p) => ({ params: { slug: p.id }, props: { post: p } }));
}

export const GET: APIRoute = async ({ props }) => {
	const { post } = props as { post: Awaited<ReturnType<typeof getPosts>>[number] };
	const cat = categoryOf(post.data.category);
	const no = cat.id === 'monthly' ? undefined : CATEGORIES.findIndex((c) => c.id === cat.id);
	const png = await ogPng({ title: post.data.title, part: cat.name, partNo: no });
	return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
