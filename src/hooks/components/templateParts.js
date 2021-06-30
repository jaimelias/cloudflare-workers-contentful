import {GalleryComponent} from './galleryComponent';
import {BlogIndexComponent} from './blogIndexComponent';
import {RequestForm} from './formComponent';
import {RightSideWidget} from './widgets';

const {pageIsBlog, pageHasForm} = Utilities;

export const WrapperComponent = ({request, labels, data, thisEntry, width}) => {
	
	const {entry} = thisEntry;
	const {title} = entry;
	let entryContent = EntryContentComponent({thisEntry, labels, request, data, width});
	const widget = RightSideWidget({entry, labels});
	
	return (width === 'fixed') ? `
	<div class="container">
		<h1 class="entry-title display-5 mb-4">${title}</h1>
			<div class="row g-5">
				<div class="col-md-8">
					<div class="entry-content" >
						${entryContent}
					</div>
				</div>
				<div class="col-md-4">${widget}</div>
			</div>
		</div>
	` : `<div class="entry-content entry-full-width">${entryContent}</div>`;
};

export const EntryContentComponent = ({thisEntry, labels, request, data, width}) => {

	let entryContent = '';
	const {entry, entryType} = thisEntry;
	const {content, imageGallery, updatedAt, currentLanguage} = entry;
	const {slug, pageNumber, homeUrl} = request;
	const {posts, websites} = data;
	const website = websites.entries[0];
	const hasForm = pageHasForm({data, request});
	const isBlog = pageIsBlog({slug, website});
	const date = Utilities.formatDate({date: updatedAt, lang: currentLanguage});
	const {labelNoPosts} = labels;

	entryContent += GalleryComponent({data: imageGallery});
	entryContent += (entryType === 'posts') ? `<div class="mb-4 text-muted fw-light"><small>${date}</small></div>` : '';
	entryContent += (typeof content === 'string') ? marked(content) : '';

	if(isBlog)
	{		
		if(posts.total > 0)
		{
			entryContent += '<hr/>' + BlogIndexComponent({posts, width, pageNumber, homeUrl});
		}
		else
		{
			entryContent += `<hr/><div class="text-muted">${labelNoPosts}.</div>`;
		}
	}

	entryContent += (hasForm) ? RequestForm({
		data,
		labels,
		request
	}) : '';

	return entryContent;
};

export const getTitle = ({request, thisEntry, data, labels}) => {

	const {entry} = thisEntry;
	let {title} = entry;
	const {slug, pageNumber} = request;
	const website = data.websites.entries[0];
	const isBlog = pageIsBlog({slug, website});
	const {labelPageNumber} = labels;
	
	if(isBlog)
	{
		return (pageNumber > 1) ? `${title} | ${labelPageNumber} ${pageNumber}` : title;
	}
	
	return title;
};

export const packageGrid = ({request, data}) => {
	
	let output = '';
	const {homeUrl} = request;
	const packages = data.packages.entries;
	const websites = data.websites.entries;
	const website = websites[0];

	if(Array.isArray(packages))
	{
		if(packages.length > 0)
		{
			const count = packages.length;
			const operator = (count >= 4) ? 4 : (count >= 3) ? 3 : 2;
			const md = (operator === 4) ? '3' : (operator === 3) ? '4' : '6';
			const rowStart = '<div class="row g-5">';
			output = rowStart;
			
			packages.forEach((r, i) => {
				
				let image = '';
				const url = `${homeUrl}${r.slug}`;
				const index = (i + 1);
				const addNewRow = ((index % operator) === 0) ? true : false;
				const colStart = `<div class="col-md-${md}">`;
				const rowEnd = `</div></div>`;
				const rowRestart = `${rowEnd}${rowStart}`;
				const rowBreak = (count === index) ? rowEnd : (addNewRow) ? rowRestart : '</div>';
				
				if(r.hasOwnProperty('imageGallery'))
				{
					if(r.imageGallery.length > 0)
					{
						const maxWidth = 768;
						const {width, height, src} = r.imageGallery[0];
						const maxHeight = Math.round((height / width) * maxWidth);
						const media = Utilities.Media({
							...r.imageGallery[0],
							maxHeight,
							className: 'card-img-top img-fluid'
						});	
						image = `<a class="text-dark" href="${url}">${media}</a>`;
					}			
				}
				
				let badge = (r.priceFrom) ? `<a href="${url}" class="position-absolute top-0 end-0 bg-warning text-dark p-2">${r.priceFrom}</a>` : '';
				
				let row = `
					${colStart}
						<div class="card position-relative">
							${image}
							<div class="card-body">
							<p class="card-text"><a class="text-dark" href="${url}">${r.title}</a></p>
							</div>
							${badge}
						</div>
					${rowBreak}
				`;
								
				output += row;
			});
			
			output += '<hr/>'			
		}
	}
	
	return output;
}