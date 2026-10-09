import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { getPosts } from '../lib/posts';

export async function GET(context) {
	const posts = await getPosts();
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			// 月次収支は日付を出さない（設立月の逆算を防ぐ）
			...(post.data.category === 'monthly' ? {} : { pubDate: post.data.pubDate }),
			link: `/posts/${post.id}/`,
		})),
	});
}
