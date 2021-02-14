import {GalleryComponent} from '../components/galleryComponent';
import {IndexPageComponent} from '../components/indexPageComponent';
import {BlogIndexComponent} from '../components/blogIndexComponent';
import {RequestForm} from '../components/formComponent';

export const templateHook = ({store, thisPageHasForm, sharedData, labels}) => {
	
	const {getState, dispatch} = store;
	const request = getState().request.data;
	const website = getState().contentful.data.websites.entries[0];
	const pages = getState().contentful.data.pages.entries;
	const posts = getState().contentful.data.posts;
	const {slug, pageNumber, homeUrl} = request;
	const getPage = pages.find(i => i.slug === slug);
	const pageIsBlog = () => slug === website.blogPage.slug;
	const getPost = posts.entries.find(i => i.slug === slug);
	
	let payload = {
		title: labels.notFoundTitle,
		content: entryWrapper({title: labels.notFoundTitle, content: ''}),
		status: 404
	}

	if(slug === '')
	{
		const {imageGallery, title, description } = website;
		const indexPage = IndexPageComponent({website, labels, GalleryComponent});
		
		payload = {
			title,
			description,
			content: indexPage,
			imageGallery,
			status: 200
		};
	}
	else if(typeof getPage  === 'object')
	{		
		const {content, description, title, imageGallery, currentLanguage} = getPage;
		const {labelPageNumber, labelNoPosts} = labels;
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

		entryContent += (thisPageHasForm) ? RequestForm({
			type: website.type,
			labels,
			accommodationTypes: sharedData.accommodationTypes,
			currentLanguage
		}) : '';

		payload = {
			title: pageTitle,
			description,
			content: entryWrapper({title, content: entryContent, date: ''}),
			imageGallery,
			status
		};
	}
	else if(typeof getPost === 'object')
	{
		const {imageGallery, title, content, description, currentLanguage, updatedAt} = getPost;
		let entryContent = '';
		entryContent += GalleryComponent({data: imageGallery});
		entryContent = (typeof content === 'string') ? marked(content) : '';

		const date = Utilities.formatDate({
			date: updatedAt,
			lang: currentLanguage
		});

		payload = {
			title,
			description,
			content: entryWrapper({title, content: entryContent, date}),
			imageGallery,
			status: 200
		};
	}
	
	dispatch({type: ActionTypes.FILTER_TEMPLATE, payload});
}; 

const entryWrapper = ({content, title, date}) => {

	let meta = '';

	meta += (date) ? `<div class="mb-2 text-muted fw-light"><small>${date}</small></div>` : '';

	return `
	<div class="container">
		${meta}
		<h1 class="entry-title">${title}</h1>
			<div class="row">
				<div class="col-md-8">
					<div class="entry-content" >
						${content ? content : ''}
					</div>
				</div>
				<div class="col-md-4" style="border-left: 1px solid #ddd;"></div>
			</div>
		</div>
	`;
};