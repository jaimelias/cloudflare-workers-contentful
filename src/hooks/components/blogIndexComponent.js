export const BlogIndexComponent = ({posts, homeUrl}) => renderPosts({posts, homeUrl});

const renderPosts = ({posts, homeUrl}) => {
	
	let output = '';
	const {entries} = posts;
	
	if(Array.isArray(entries))
	{
		if(entries.length > 0)
		{
			output = '<hr/>';
			output += entries.map(p => stylePost({post: p, homeUrl})).join('');
		}
	}
	
	return output;
};

const stylePost = ({post, homeUrl}) => {
	
	const {formatDate} = Utilities;
	const {title, description, updatedAt, currentLanguage, slug} = post;
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