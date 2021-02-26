const {paginateEntries} = Utilities;
const postsPerPage = 10;

export const BlogIndexComponent = ({store}) => {
	const {getState} = store;
	const posts = getState().contentful.data.posts;
	const request = getState().request.data;
	const {pageNumber, homeUrl} = request;
	const {entries} = posts;
	
	if(Array.isArray(entries))
	{
		const paginatedEntries = paginateEntries({items: entries, pageNumber, itemsPerPage: postsPerPage});
		return IndexComponent({paginatedEntries, homeUrl});		
	}
};

const IndexComponent = ({paginatedEntries, homeUrl}) => {
	
	const {data} = paginatedEntries;
	
	let output = '';
	
	if(data.length > 0)
	{
		output = '<hr/>';
		output += data.map(p => stylePost({post: p, homeUrl})).join('');
	}
	
	return output;
};

const stylePost = ({post, homeUrl}) => {
	
	const {formatDate} = Utilities;
	const {title, description, createdAt, currentLanguage, slug} = post;
	const date = formatDate({
		date: createdAt,
		lang: currentLanguage
	});
	
	return `
		<div class="mb-2 text-muted fw-light"><small>${date}</small></div>
		<h3><a href="${homeUrl}${slug}">${title}</a></h3>
		<p>${description}</p>
`
};