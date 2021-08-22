import {GalleryComponent} from './galleryComponent';
import {RightSideWidget} from './widgets';
import {BlogIndexComponent} from './blogIndexComponent';
import {packageGrid} from './templateParts';
const { getFallBackLang } = Utilities;

export default class IndexComponent {

	constructor({store, labels}){
		this.store = store;
		this.labels = labels;
	}
	init()
	{
		const {labels, store} = this;
		const {getState, render, dispatch} = store;
		const {data} = getState().contentful;
		const {websites} = data;
		const website = websites.entries[0];
		const {homepage} = website;
		const {title, description, imageGallery, longTitle} = homepage;
						
		render.addHooks({
			content: JsonLd(store),
			order: 60,
			location: 'head'
		});			
		
		dispatch({
			type: ActionTypes.FILTER_TEMPLATE, 
			payload: {
				title,
				longTitle,
				description,
				content: IndexWrapper({store, labels}),
				imageGallery,
				entryType: 'pages',
				status: 200
			}
		});
	}
}

const IndexWrapper = ({store, labels}) => {
	
	const {getState} = store;
	const request = getState().request.data;
	const {pageNumber, homeUrl} = request;
	const {data} = getState().contentful;
	const {posts, websites} = data;
	const {homepage} = websites.entries[0];
	const {title, description, content, imageGallery} = homepage || '';
	const RenderGallery = GalleryComponent({data: imageGallery});
	const RenderDescription = (description) ? `<p class="lead">${description}</p>` : '';
	const RenderGrid =  packageGrid({request, data});
	const RenderContent = (content) ? marked(content) : '';
	const RenderBlog = BlogIndexComponent({posts, width: 'full', pageNumber, homeUrl});
	
	let widget = RightSideWidget({
		entry: homepage,
		labels
	});

	const main = (content) ? (widget) ? `
		<div class="row">
			<div class="col-md-8">
				<div class="entry-content fs-5 entry-fixed-width">${RenderContent}</div>
			</div>
			<div class="col-md-4">
				${widget}
			</div>
		</div>	
	` : `<div class="entry-content fs-5 entry-full-width">${RenderContent}</div>` : '';
	
	return `
		<div class="container">
			<div class="text-center">
				<div class="mb-5">
					${RenderGallery}
				</div>
				<h1 class="display-5 my-3">${title}</h1>
				<div>${RenderDescription}</div>
			</div>
			<hr/>
			${main}
			${RenderGrid}
			${RenderBlog}
		</div>	
	`;
};

const JsonLd = store => {
	
	const {getState} = store;
	const website = getState().contentful.data.websites.entries[0];
	const {homepage: {title}} = website || '';
	const {siteName, location, streetAddress, telephoneNumber, imageGallery, priceRange, type, coordinates} = website;
	const {country, stateProvince, name: locationName} = location || '';
	

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
	
	if(typeof country === 'object'){
		if(country.hasOwnProperty('code'))
		{
			address.addressCountry = country.code;
			showAddress = true;
		}
	}
	
	if(locationName)
	{
		address.addressLocality = locationName;
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