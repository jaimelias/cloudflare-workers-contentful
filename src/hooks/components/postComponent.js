import {GalleryComponent} from './galleryComponent';

export default class PostComponent {

	constructor({store, labels}){
		this.store = store;
		this.labels = labels;
	}
	init(thisPage)
	{
		const {data: post, type} = thisPage;
		const {store} = this;
		const {dispatch, render} = store;
		const {imageGallery, title, content, description, currentLanguage, updatedAt} = post;
		
		let entryContent = '';
		entryContent += GalleryComponent({data: imageGallery});
		entryContent += (typeof content === 'string') ? marked(content) : '';

		render.addHooks({
			content: JsonLd({post, store}),
			order: 60,
			location: 'head'
		});	

		const date = Utilities.formatDate({
			date: updatedAt,
			lang: currentLanguage
		});

		dispatch({
			type: ActionTypes.FILTER_TEMPLATE, 
			payload: {
				title,
				description,
				content: postWrapper({title, content: entryContent, date}),
				imageGallery,
				status: 200
			}
		});
	}
}

const postWrapper = ({content, title, date}) => {

	let meta = '';
	meta += (date) ? `<div class="mb-2 text-muted fw-light"><small>${date}</small></div>` : '';

	return `
	<div class="container">
		${meta}
		<h1 class="entry-title display-5 mb-4">${title}</h1>
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

const JsonLd = ({post, store}) => {

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