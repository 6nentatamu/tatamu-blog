import { CATEGORIES } from '../../data/categories';
import { getPosts } from '../../lib/posts';
export async function load() {
	const posts = await getPosts();
	const latest = posts.filter((p) => p.data.category !== 'prequel').slice(0, 6);
	const parts = CATEGORIES.filter((c) => c.id !== 'monthly');
	return { latest, parts };
}
