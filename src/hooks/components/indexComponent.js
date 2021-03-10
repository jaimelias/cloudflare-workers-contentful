import {GalleryComponent} from './galleryComponent';

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
		const {homepage} = website;
		const {title, description, imageGallery} = homepage || '';
		
		render.addHooks({
			content: JsonLd(store),
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
	
	const {amenities, included, notIncluded, homepage} = website;	
	const {title, description, content, imageGallery} = homepage || '';
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

const JsonLd = (store) => {
	
	let output = '';
	const {getState} = store;
	const website = getState().contentful.data.websites.entries[0];
	const {homepage: {title}} = website || '';
	const {siteName, countryCode, location, stateProvince, streetAddress, telephoneNumber, imageGallery, priceRange, type, coordinates} = website;

	let ld = {
		'@content': 'https://schema.org',
		"@type": type,
		name: siteName,
		description: title,
		starRating: {
			'@type': 'Rating',
			ratingValue: '5'
		}
	};
	
	if(telephoneNumber)
	{
		ld.telephone = telephoneNumber;
	}
	
	if(priceRange)
	{
		ld.priceRange = priceRange;
	}
	
	if(Array.isArray(imageGallery))
	{
		if(typeof imageGallery[0] === 'object')
		{
			ld.photo = `/images/${imageGallery[0].fileName}`;
		}
	}

	
	let showAddress = false;
	let address = {
		'@type': 'PostalAddress'
	};
	
	if(countryCode){
		address.addressCountry = countryCode;
		showAddress = true;
	}
	
	if(location)
	{
		address.addressLocality = location;
		showAddress = true;
	}
	
	if(stateProvince)
	{
		address.addressRegion = stateProvince;
		showAddress = true;
	}
	
	if(streetAddress)
	{
		address.streetAddress = streetAddress;
		showAddress = true;
	}
	
	if(showAddress)
	{
		ld.address = address;
	}
	
	if(typeof coordinates === 'object')
	{
		if(coordinates.hasOwnProperty('lat') && coordinates.hasOwnProperty('lon'))
		{
			ld.geo = {
				'@type': 'GeoCoordinates',
				latitude: coordinates.lat,
				longitude: coordinates.lon
			};
		}
	}
					
	return `<script type="application/ld+json">${JSON.stringify(ld)}</script>`;
};