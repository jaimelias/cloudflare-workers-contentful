import {GalleryComponent} from './galleryComponent';
import {BlogIndexComponent} from './blogIndexComponent';
import {RequestForm} from './formComponent';
import {RightSideWidget} from './widgets';
const {accommodationTypes} = SharedData;
const {pageHasForm} = Utilities;

const pageIsBlog = ({slug, website}) => {
	
	if(typeof website.blogPage === 'object')
	{
		if(slug === website.blogPage.slug)
		{
			return true;
		}
	}			
};

export default class PageComponent {

	constructor({store, labels}){
		this.store = store;
		this.labels = labels;
	}
	init(page)
	{
		
		const {labels, store} = this;
		const {getState, dispatch} = store;
		const request = getState().request.data;
		const website = getState().contentful.data.websites.entries[0];
		const posts = getState().contentful.data.posts;
		const hasForm = pageHasForm({website, request});
		const {labelPageNumber, labelNoPosts} = labels;
		const {slug, pageNumber, homeUrl} = request;
		const {content, description, title, imageGallery, currentLanguage} = page;
		const isBlog = pageIsBlog({slug, website});
		let entryContent = '';
		let pageTitle = title;
		let status = 200;
		entryContent += GalleryComponent({data: imageGallery});
		entryContent += (typeof content === 'string') ? marked(content) : '';
		
		const widget = RightSideWidget({
			entry: page,
			labels
		});
				
		if(isBlog)
		{
			pageTitle = (pageNumber > 1) ? `${pageTitle} | ${labelPageNumber} ${pageNumber}` : pageTitle;
			
			if(posts.total > 0)
			{
				entryContent += BlogIndexComponent({store});
			}
			else
			{
				status = 404;
				entryContent += `<hr/><div class="text-muted">${labelNoPosts}.</div>`;
			}
		}

		entryContent += (hasForm) ? RequestForm({
			type: website.type,
			labels,
			accommodationTypes,
			currentLanguage
		}) : '';

		dispatch({
			type: ActionTypes.FILTER_TEMPLATE, 
			payload: {
				title: pageTitle,
				description,
				content: pageWrapper({title, content: entryContent, widget}),
				imageGallery,
				status
			}
		});
	}
}

const pageWrapper = ({content, title, widget}) => {

	return `
	<div class="container">
		<h1 class="entry-title">${title}</h1>
			<div class="row">
				<div class="col-md-8">
					<div class="entry-content" >
						${content}
					</div>
				</div>
				<div class="col-md-4" style="border-left: 1px solid #ddd;">${widget}</div>
			</div>
		</div>
	`;
};