import {GalleryComponent} from './galleryComponent';
import {BlogIndexComponent} from './blogIndexComponent';
import {RequestForm} from './formComponent';


export default class PageComponent {

	constructor({store, labels, sharedData, hasForm}){
		this.store = store;
		this.labels = labels;
		this.hasForm = hasForm,
		this.sharedData = sharedData;
	}
	init(page)
	{
		
		const {labels, sharedData, hasForm, store} = this;
		const {getState, dispatch} = store;
		const request = getState().request.data;
		const website = getState().contentful.data.websites.entries[0];
		const posts = getState().contentful.data.posts;
		const {labelPageNumber, labelNoPosts} = labels;
		const {slug, pageNumber, homeUrl} = request;
		const {content, description, title, imageGallery, currentLanguage} = page;
		const pageIsBlog = () => slug === website.blogPage.slug;
		let entryContent = '';
		let pageTitle = title;
		let status = 200;
		entryContent += GalleryComponent({data: imageGallery});
		entryContent += (typeof content === 'string') ? marked(content) : '';
				
		if(pageIsBlog())
		{
			pageTitle = (pageNumber > 1) ? `${pageTitle} | ${labelPageNumber} ${pageNumber}` : pageTitle;
			
			if(posts.total > 0)
			{
				entryContent += BlogIndexComponent({posts, homeUrl});
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
			accommodationTypes: sharedData.accommodationTypes,
			currentLanguage
		}) : '';

		dispatch({
			type: ActionTypes.FILTER_TEMPLATE, 
			payload: {
				title: pageTitle,
				description,
				content: pageWrapper({title, content: entryContent}),
				imageGallery,
				status
			}
		});
	}
}

const pageWrapper = ({content, title}) => {

	return `
	<div class="container">
		<h1 class="entry-title">${title}</h1>
			<div class="row">
				<div class="col-md-8">
					<div class="entry-content" >
						${content}
					</div>
				</div>
				<div class="col-md-4" style="border-left: 1px solid #ddd;"></div>
			</div>
		</div>
	`;
};