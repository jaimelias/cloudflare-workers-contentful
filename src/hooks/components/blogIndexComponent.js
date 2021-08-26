const {paginateEntries} = Utilities;
const postsPerPage = 10;

export const BlogIndexComponent = ({posts, width, pageNumber, homeUrl}) => {
	
	const {entries} = posts;
	
	if(Array.isArray(entries))
	{
		const paginatedEntries = paginateEntries({items: entries, pageNumber, itemsPerPage: postsPerPage});
		return IndexComponent({paginatedEntries, homeUrl, width});		
	}
};

const IndexComponent = ({paginatedEntries, homeUrl, width}) => {
	
	let notFeatured = '';
	let featured = '';
	let output = '';
	const {total, data} = paginatedEntries;
	let args = {homeUrl, total};
	let last = data.length;

	if(total > 0)
	{
		const featuredData = data.filter(p => p.featured);
		const notFeaturedData = data.filter(p => !p.featured);
		
		if(width === 'fixed')
		{
			featured = featuredData
				.map((p, i) => stylePost({...args, post: p, showFeatured: true, index: i, last: featuredData.length, showImage: true}))
				.join('');
			
			notFeatured = notFeaturedData
				.map((p, i) => stylePost({...args, post: p, showFeatured: false, index: i, last: notFeaturedData.length, showImage: true}))
				.join('');
		}
		else
		{			
			if(total === 1)
			{
				featured = featuredData
					.map((p, i) => stylePost({...args, post: p, showFeatured: true, index: i, last: featuredData.length, showImage: true}))
					.join('');
			}
			else
			{
				featured = featuredData
					.map((p, i) => stylePost({...args, post: p, showFeatured: true, index: i, last: featuredData.length, showImage: true}))
					.join('');
					
				notFeatured = notFeaturedData
					.map((p, i) => stylePost({...args, post: p, showFeatured: false, index: i, last: notFeaturedData.length, showImage: false}))
					.join('');
			}
		}
		
		if(featured && notFeatured && width === 'full')
		{
			output = `
				
				<div class="row g-5">
					<div class="col-md">
						${featured}
						<div class="d-block d-md-none"><hr/></div>
					</div>
					<div class="col-md">
						${notFeatured}
					</div>
				</div>
			`;			
		}
		else
		{
			output = (featured) ? `${featured} <hr/>` : output;
			output += (notFeatured) ? notFeatured : output;
		}
	}
	
	return output;
};

const stylePost = ({post, homeUrl, showFeatured, index, last, showImage}) => {
	
	let template = '';
	const {formatToReadableDate} = Utilities;
	const {title, description, createdAt, currentLanguage, slug, shortContent, featured, imageGallery} = post;
	const date = formatToReadableDate({
		date: createdAt,
		lang: currentLanguage
	});
	
	let image = '';
	const renderDescription = (description) ? `<p>${description}</p>` : '';
	
	if(Array.isArray(imageGallery) && showImage)
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
	
			template = `
				<h3><a href="${homeUrl}${slug}">${title}</a></h3>
				${image}
				<div class="my-2 text-muted fw-light"><small>${date}</small></div>
				${renderContent}
			`;
		}
		else
		{
			template = `
				<h3><a href="${homeUrl}${slug}">${title}</a></h3>
				${image}
				<div class="mb-2 text-muted fw-light"><small>${date}</small></div>
				${renderDescription}
			`
		}

		if(template && (index + 1) !== last)
		{
			template += '<hr/>';
		}
	}
	
	return template;
};