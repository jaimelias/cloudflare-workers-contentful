export default class NotFoundComponent {

	constructor({store, labels}){
		this.store = store;
		this.labels = labels;
	}
	init()
	{
		const {labels, store} = this;
		const {dispatch} = store;
		const {notFoundTitle} = labels;
		
		dispatch({
			type: ActionTypes.FILTER_TEMPLATE, 
			payload: {
				title: notFoundTitle,
				content: NotFoundWrapper({title: notFoundTitle, content: ''}),
				entryType: 'notFound',
				status: 404
			}
		});
	}
}

const NotFoundWrapper = ({title}) => {

	return `
	<div class="container">
		<h1 class="entry-title">${title}</h1>
			<div class="row">
				<div class="col-md-8">
					<div class="entry-content" ></div>
				</div>
				<div class="col-md-4" style="border-left: 1px solid #ddd;"></div>
			</div>
		</div>
	`;
};