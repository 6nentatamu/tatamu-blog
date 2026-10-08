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
