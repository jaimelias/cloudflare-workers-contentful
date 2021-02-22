import {GalleryComponent} from './galleryComponent';

export default class PostComponent {

	constructor({store, labels}){
		this.store = store;
		this.labels = labels;
	}
	init(post)
	{
		const {store} = this;
		const {dispatch} = store;
		const {imageGallery, title, content, description, currentLanguage, updatedAt} = post;
		
		let entryContent = '';
		entryContent += GalleryComponent({data: imageGallery});
		entryContent = (typeof content === 'string') ? marked(content) : '';

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