import {getTitle, WrapperComponent} from './templateParts';

export default class PackageComponent {

	constructor({store, labels}){
		this.store = store;
		this.labels = labels;
		this.width = 'fixed';
	}
	setWidth(width)
	{
		this.width = (width === 'full' || width === 'fixed') ? width : this.width;
	}
	getWidth()
	{
		return this.width;
	}
	init(thisEntry)
	{
		const {entry} = thisEntry;
		const {labels, store} = this;
		const {getState, dispatch} = store;
		const request = getState().request.data;
		const {data} = getState().contentful;
		const {description, imageGallery, longTitle} = entry;

		dispatch({
			type: ActionTypes.FILTER_TEMPLATE, 
			payload: {
				title: getTitle({request, thisEntry, data, labels}),
				longTitle,
				description,
				content: WrapperComponent({request, labels, data, thisEntry, width: this.width}),
				imageGallery,
				status: 200
			}
		});
	}
}
