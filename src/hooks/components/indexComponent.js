import {GalleryComponent} from './galleryComponent';
import {JsonLd} from './jsonLdComponent';

export default class IndexComponent {

	constructor({store, labels}){
		this.store = store;
		this.labels = labels;
	}
	init()
	{
		const {labels, store} = this;
		const {getState, render, dispatch} = store;
		const website = getState().contentful.data.websites.entries[0];
		const {imageGallery, title, description} = website;
		
		render.addHooks({
			content: JsonLd({website: website}),
			order: 60,
			location: 'head'
		});			
		
		dispatch({
			type: ActionTypes.FILTER_TEMPLATE, 
			payload: {
				title,
				description,
				content: IndexWrapper({website, labels}),
				imageGallery,
				status: 200
			}
		});
	}
}


const IndexWrapper = ({website, labels}) => {
	
	const {title, description, content, imageGallery, amenities, included, notIncluded} = website;
	const {labelIncluded, labelNotIncluded, labelAmenities} = labels;

	const RenderGallery = GalleryComponent({data: imageGallery});
	
	const RenderDescription = (description) ? `<p class="lead">${description}</p>` : '';
	const RenderContent = (content) ? marked(content) : '';
	const amenitiesList = (amenities) ? amenities.map(row => {
		return `<li class="list-group-item">✔️ ${row}</li>`;
	}).join('') : '';

	const RenderAmenities = (amenitiesList) ? `<ul class="list-group mb-2"><li class="list-group-item list-group-item-light font-weight-bold">${labelAmenities}</li>${amenitiesList}</ul>` : '';

	const includedList = (included) ? included.map(row => {
		return `<li class="list-group-item ">✔️ ${row}</li>`;
	}).join('') : '';

	const RenderIncluded = (includedList) ? `<ul class="list-group  mb-2"><li class="list-group-item list-group-item-light font-weight-bold">${labelIncluded}</li>${includedList}</ul>` : '';

	const notIncludedList = (notIncluded) ? notIncluded.map(row => {
		return `<li class="list-group-item">❌ ${row}</li>`;
	}).join('') : '';

	const RenderNotIncluded = (notIncludedList) ? `<ul class="list-group  mb-2"><li class="list-group-item list-group-item-light font-weight-bold">${labelNotIncluded}</li>${notIncludedList}</ul>` : '';
	
	return `
		<div class="container">
			<div class="text-center">
				<div class="mb-5">
					${RenderGallery}
				</div>
				<h1 class="h2 serif">${title}</h1>
				${RenderDescription}
				<hr/>
			</div>
			<div class="row">
				<div class="col-md-8">
					<div class="entry-content">${RenderContent}</div>
				</div>
				<div class="col-md-4">
					<div>${RenderAmenities}</div>				
					<div>${RenderIncluded}</div>
					<div>${RenderNotIncluded}</div>				
				</div>
			</div>
		</div>	
	`;
};