import {GalleryComponent} from './galleryComponent';
import {BlogIndexComponent} from './blogIndexComponent';
import {RequestForm} from './formComponent';
import {RightSideWidget} from './widgets';
const {pageHasForm, pageIsBlog} = Utilities;

export default class PageComponent {

	constructor({store, labels}){
		this.store = store;
		this.labels = labels;
		this.width = 'fixed';
	}
	setWidth(width)
	{
		this.width = (width === 'full' || width === 'fixed') ? width : this.width;
	}
	getWidth()
	{
		return this.width;
	}
	init(thisEntry)
	{
		const {entry, entryType} = thisEntry;
		const {labels, store} = this;
		const {getState, dispatch} = store;
		const request = getState().request.data;
		const {data} = getState().contentful;
		const {description, imageGallery} = entry;

		dispatch({
			type: ActionTypes.FILTER_TEMPLATE, 
			payload: {
				title: getTitle({request, thisEntry, data, labels}),
				description,
				content: wrapperComponent({request, labels, data, thisEntry, width: this.width}),
				imageGallery,
				status: 200
			}
		});
	}
}

const getTitle = ({request, thisEntry, data, labels}) => {

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

const entryContentComponent = ({thisEntry, labels, request, data, width}) => {

	let entryContent = '';
	const {entry} = thisEntry;
	const {content, imageGallery} = entry;
	const {slug, pageNumber, homeUrl} = request;
	const {posts, websites} = data;
	const website = websites.entries[0];
	const hasForm = pageHasForm({website, request});
	const isBlog = pageIsBlog({slug, website});
	const {labelNoPosts} = labels;

	entryContent += GalleryComponent({data: imageGallery});
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

const wrapperComponent = ({request, labels, data, thisEntry, width}) => {
	
	const {entry} = thisEntry;
	const {title} = entry;
	let entryContent = entryContentComponent({thisEntry, labels, request, data, width});
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