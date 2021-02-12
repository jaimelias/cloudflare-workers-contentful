import {GalleryComponent} from '../components/galleryComponent';
import {IndexPageComponent} from '../components/indexPageComponent';
import {RequestForm} from '../components/formComponent';

export const templateHook = ({store, labels, thisPageHasForm, sharedData}) => {
	
	const {getState, dispatch} = store;
	const {slug} = getState().request.data;
	const website = getState().contentful.data.websites[0];
	const {imageGallery, type, title, description, content, currentLanguage} = website;
	const pages = getState().contentful.data.pages;
	const getPage = pages.find(i => i.slug === slug);
		
	if(slug === '')
	{		
		dispatch({type: ActionTypes.FILTER_TEMPLATE, payload: {
			title,
			description,
			content: IndexPageComponent({website, labels, GalleryComponent}),
			imageGallery,
			status: 200
		}});
	}
	else if(typeof getPage  === 'object')
	{		
		const {content, description, title, imageGallery} = getPage;
		const RenderGallery = (imageGallery) ? GalleryComponent({
			data: imageGallery
		}): '';
		
		let formArgs = {
			type,
			labels,
			grid: thisPageHasForm,
			accommodationTypes: sharedData.accommodationTypes,
			currentLanguage
		};
		
		const RenderRequestForm = RequestForm(formArgs);
		const RenderContent = (typeof content === 'string') ? marked(content) : '';
			
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
		
		dispatch({type: ActionTypes.FILTER_TEMPLATE, payload: {
			title,
			description,
			content: `<div class="container"><h1>${title}</h1>${contentWrapper()}</div>`,
			imageGallery,
			status: 200
		}});		
		
	}
	else
	{
		const {notFoundTitle} = labels;		
		
		dispatch({type: ActionTypes.FILTER_TEMPLATE, payload: {
			title: notFoundTitle,
			content: `<div class="container"><h1>${notFoundTitle}</h1></div>`,
			status: 404
		}});
	}
}; 