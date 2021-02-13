export const BlogIndexComponent = ({posts}) => renderPosts({posts});

const renderPosts = ({posts}) => {
	
	let output = '';
	
	if(Array.isArray(posts))
	{
		if(posts.length > 0)
		{
			output = '<hr/>';
			output += posts.map(p => stylePost(p)).join('');
		}
	}
	
	return output;
};

const stylePost = (post) => {
	
	const {formatDate, getHomeUrl} = Utilities;
	const {title, description, content, updatedAt, currentLanguage, defaultLanguage, slug} = post;
	const homeUrl = getHomeUrl({currentLanguage, defaultLanguage});
	const date = formatDate({
		date: updatedAt,
		lang: currentLanguage
	});
	
	return `
<div class="mb-2 text-muted fw-light"><small>${date}</small></div>
<h3><a href="${homeUrl}${slug}">${title}</a></h3>
<p>${description}</p>
`
};