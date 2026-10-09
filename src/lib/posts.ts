import { getCollection, type CollectionEntry } from 'astro:content';
import type { CategoryId } from '../data/categories';

// 下書き（draft: true）は開発中だけ表示し、本番ビルドには出さない
export async function getPosts(): Promise<CollectionEntry<'posts'>[]> {
	const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
	return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

// 連載の順（部の中は order、なければ公開日）
export function seriesOrder(posts: CollectionEntry<'posts'>[], category: CategoryId) {
	return posts
		.filter((p) => p.data.category === category)
		.sort(
			(a, b) =>
				(a.data.order ?? Infinity) - (b.data.order ?? Infinity) ||
				a.data.pubDate.valueOf() - b.data.pubDate.valueOf(),
		);
}

// 読了時間（本文の文字数 ÷ 500字/分、切り上げ）。記号・リンク先・タグは数えない
export function readingMinutes(post: CollectionEntry<'posts'>) {
	const text = (post.body ?? '')
		.replace(/^---[\s\S]*?---/, '')
		.replace(/<[^>]+>/g, '')
		.replace(/\]\([^)]*\)/g, ']')
		.replace(/[#>*|`\-\s[\]:]/g, '');
	return Math.max(1, Math.ceil([...text].length / 500));
}

// アイキャッチ画像のパス
export function ogPath(post: CollectionEntry<'posts'>) {
	return `/og/${post.id}.png`;
}

// 関連記事：同じ部を優先し、足りなければタグの重なり、最後に新しい順
export function relatedPosts(posts: CollectionEntry<'posts'>[], post: CollectionEntry<'posts'>, n = 3) {
	const score = (p: CollectionEntry<'posts'>) =>
		(p.data.category === post.data.category ? 10 : 0) + p.data.tags.filter((t) => post.data.tags.includes(t)).length;
	return posts
		.filter((p) => p.id !== post.id)
		.map((p) => ({ p, s: score(p) }))
		.sort((a, b) => b.s - a.s || b.p.data.pubDate.valueOf() - a.p.data.pubDate.valueOf())
		.slice(0, n)
		.map((x) => x.p);
}
