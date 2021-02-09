import {GalleryComponent} from './galleryComponent';
import {IndexPageComponent} from './indexPageComponent';
import {RequestForm} from './formComponent';

export const Content = ({store, slug, title, description, content, labels, is404, pages, thisPageHasForm, sharedData, currentLanguage}) => {
	
	let output = '';
	const {getState, dispatch} = store;
	const {amenities, included, notIncluded, imageGallery, type} = getState().contentful.data.websites[0];
	
	if(slug === '')
	{
		const {labelIncluded, labelNotIncluded, labelAmenities} = labels;

		output = IndexPageComponent({
			title, 
			description, 
			content,
			imageGallery,
			amenities,
			included,
			notIncluded,
			labelIncluded,
			labelNotIncluded,
			labelAmenities,
			GalleryComponent
		});
		
		dispatch({type: ActionTypes.FILTER_TEMPLATE, payload: {
			title,
			description,
			content,
			imageGallery,
			status: 200
		}});
	}
	else
	{	
		if(is404)
		{
			const {notFoundTitle} = labels;

			output = `
				<div class="container">
					<h1>${notFoundTitle}</h1>
				</div>			
			`;
		}
		else
		{
			const getPage = pages.find(i => i.slug === slug);
			
			if(getPage)
			{
				const {content, title, imageGallery} = getPage;
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
				
				output = `
					<div class="container">
						<h1>${title}</h1>
						${contentWrapper()}
					</div>
				`;	
			}
			else
			{
				output = error;
			}
		}
	}

	return `
		<div class="container-fluid my-5">
			${output}
		</div>
	`;
}; 