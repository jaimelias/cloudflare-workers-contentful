import {GalleryComponent} from '../components/galleryComponent';
import {IndexPageComponent} from '../components/indexPageComponent';
import {BlogIndexComponent} from '../components/blogIndexComponent';
import {RequestForm} from '../components/formComponent';

export const templateHook = ({store, thisPageHasForm, sharedData, labels}) => {
	
	const {getState, dispatch} = store;
	const {slug, pageNumber} = getState().request.data;
	const website = getState().contentful.data.websites[0];
	const pages = getState().contentful.data.pages;
	const getPage = pages.find(i => i.slug === slug);
	const pageIsBlog = ({slug, blogPage}) => slug === website.blogPage.slug;
	
	let payload = {
		title: labels.notFoundTitle,
		content: `<div class="container"><h1>${labels.notFoundTitle}</h1></div>`,
		status: 404
	}
		
	if(slug === '')
	{
		const {imageGallery, title, description, content } = website;
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
		const RenderGallery = GalleryComponent({data: imageGallery});
		let pageTitle = title;
		let status = 200;
		
		let formArgs = {
			type: website.type,
			labels,
			grid: thisPageHasForm,
			accommodationTypes: sharedData.accommodationTypes,
			currentLanguage
		};
		
		const RenderRequestForm = RequestForm(formArgs);
		let RenderContent = (typeof content === 'string') ? marked(content) : '';
		const posts = getState().contentful.data.posts;
				
		if(pageIsBlog && Array.isArray(posts))
		{
			
			pageTitle = (pageNumber > 1) ? `${pageTitle} | p. ${pageNumber}` : pageTitle;
			
			if(posts.length > 0)
			{
				RenderContent += BlogIndexComponent({posts});
			}
			else
			{
				status = 404;
				RenderContent += 'no posts found';
			}
		}
			
		const contentWrapper = () => {
			
			let output = '';
			let hr = (thisPageHasForm) ? '<hr/>' : '';
			
			const entryContent = `
				<div class="entry-content" >
					${RenderGallery}
					${RenderContent}
					${hr}
					${thisPageHasForm ? RenderRequestForm : ''}
				</div>				
			`;					
			
			output = `
				<div class="row">
					<div class="col-md-8">
						${entryContent}
					</div>
					<div class="col-md-4" style="border-left: 1px solid #ddd;">
						${thisPageHasForm ? '' : RenderRequestForm}
					</div>
				</div>
			`;
			
			return output;
		};		
		
		payload = {
			title: pageTitle,
			description,
			content: `<div class="container"><h1>${title}</h1>${contentWrapper()}</div>`,
			imageGallery,
			status
		};
	}
	
	dispatch({type: ActionTypes.FILTER_TEMPLATE, payload});
}; 