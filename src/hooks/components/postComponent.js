import {WrapperComponent} from './templateParts';


export default class PostComponent {

	constructor({store, labels}){
		this.store = store;
		this.labels = labels;
		this.width = 'fixed';
	}
	init(thisEntry)
	{
		const {entry} = thisEntry;
		const {store, labels} = this;
		const {dispatch, render, getState} = store;
		const request = getState().request.data;
		const {data} = getState().contentful;
		const {imageGallery, title, description} = entry;

		render.addHooks({
			content: JsonLdComponent({post: entry, store}),
			order: 60,
			location: 'head'
		});	


		dispatch({
			type: ActionTypes.FILTER_TEMPLATE, 
			payload: {
				title,
				description,
				content: WrapperComponent({request, labels, data, thisEntry, width: this.width}),
				imageGallery,
				status: 200
			}
		});
	}
}

const JsonLdComponent = ({post}) => {

	const {imageGallery, title, description, currentLanguage, updatedAt, createdAt} = post;

	let ld = {
		'@context': 'http://schema.org',
		'@type': 'BlogPosting',
		dateCreated: createdAt,
		datePublished: createdAt,
		dateModified: updatedAt,
		inLanguage: currentLanguage,
		headline: title,
		articleBody: description
	};

	if(Array.isArray(imageGallery))
	{
		if(typeof imageGallery[0] === 'object')
		{
			ld.image = `/images/${imageGallery[0].fileName}`;
		}
	}


	return `<script type="application/ld+json">${JSON.stringify(ld)}</script>`;
};