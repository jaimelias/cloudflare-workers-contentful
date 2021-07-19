const {paginateEntries} = Utilities;
const postsPerPage = 10;

export const BlogIndexComponent = ({posts, width, pageNumber, homeUrl}) => {
	
	const entries = posts.entries;
	
	if(Array.isArray(entries))
	{
		const paginatedEntries = paginateEntries({items: entries, pageNumber, itemsPerPage: postsPerPage});
		return IndexComponent({paginatedEntries, homeUrl, width});		
	}
};

const IndexComponent = ({paginatedEntries, homeUrl, width}) => {
	
	let output = '';
	const {data, total} = paginatedEntries;
	let args = {homeUrl, total};
	
	

	if(total > 0)
	{
		if(width === 'fixed')
		{
			output += data.map(p => stylePost({...args, post: p, showFeatured: true})).join('');
			output += data.map(p => stylePost({...args, post: p, showFeatured: false})).join('');
		}
		else
		{
			if(total === 1)
			{
				output += data.map(p => stylePost({...args, post: p, showFeatured: true})).join('');
			}
			else
			{
				const featured = data.map(p => stylePost({...args, post: p, showFeatured: true})).join('');
				const notFeatured = data.map(p => stylePost({...args, post: p, showFeatured: false})).join('');
				
				output += `
					
					<div class="row g-5">
						<div class="col-md">
							${featured}
						</div>
						<div class="col-md">
							${notFeatured}
						</div>
					</div>
				`;
			}
		}
	}
	
	return output;
};

const stylePost = ({post, homeUrl, showFeatured, total}) => {
	
	let template = '';
	const {formatToReadableDate} = Utilities;
	const {title, description, createdAt, currentLanguage, slug, shortContent, featured, imageGallery} = post;
	const date = formatToReadableDate({
		date: createdAt,
		lang: currentLanguage
	});
	
	let image = '';
	const renderDescription = (description) ? `<p>${description}</p>` : '';
	
	
	
	if(Array.isArray(imageGallery))
	{
		if(imageGallery.length > 0)
		{
			image = `<a class="text-dark" href="${homeUrl}${slug}"><img alt="${title}" class="card-img-top" src="${imageGallery[0].src}?w=420" /></a>`;
		}			
	}	
	
	if(featured === showFeatured)
	{
		if(featured && showFeatured)
		{
			const renderContent = (typeof shortContent === 'string') ? marked(shortContent) : '';
						
			if(total === 1)
			{
				template = `
					<div class="row g-5">
						<div class="col-md">
							<h3><a href="${homeUrl}${slug}">${title}</a></h3>
							<div class="my-2 text-muted fw-light"><small>${date}</small></div>
							${renderContent}
						</div>
						<div class="col-md">
							${image}
						</div>
					</div>
					<hr/>
				`				
			}
			else
			{
				template = `
					<h3><a href="${homeUrl}${slug}">${title}</a></h3>
					${image}
					<div class="my-2 text-muted fw-light"><small>${date}</small></div>
					${renderContent}
					<hr/>
				`				
			}
		}
		else
		{
			template = `
				<h3><a href="${homeUrl}${slug}">${title}</a></h3>
				<div class="mb-2 text-muted fw-light"><small>${date}</small></div>
				${renderDescription}
				<hr/>
			`
		}		
	}
	else
	{
		
	}
	
	return template;
};