import {GalleryComponent} from './galleryComponent';
import {RightSideWidget} from './widgets';
import {BlogIndexComponent} from './blogIndexComponent';

const packageGrid = ({store}) => {
	
	let output = '';
	
	const {getState} = store;
	const {data} = getState().contentful;
	const packages = (data.packages.hasOwnProperty('entries')) ? data.packages.entries : [];
	const websites = (data.websites.hasOwnProperty('entries')) ? data.websites.entries : [];
	const {homeUrl} = getState().request.data;
	const website = websites[0];
	
	
	if(Array.isArray(packages))
	{
		if(packages.length > 0)
		{
			output = '<div class="row g-5">';
			
			packages.forEach(r => {
				
				let image = '';
				const url = `${homeUrl}${r.slug}`;
				
				if(r.hasOwnProperty('imageGallery'))
				{
					if(r.imageGallery.length > 0)
					{
						image = `<a class="text-dark" href="${url}"><img alt="${r.title}" class="card-img-top" src="${r.imageGallery[0].src}?w=420" /></a>`;
					}			
				}
				
				let row = `
					<div class="col-md-4">
						<div class="card position-relative">
							${image}
							
							<div class="card-body">
								<p class="card-text"><a class="text-dark" href="${url}">${r.title}</a></p>
							</div>
							<a href="${url}" class="position-absolute top-0 end-0 bg-warning text-dark p-2">${r.priceFrom}</a>
						</div>
					</div>
				`;
				
				output += row;
			});
			
			output += '</div><hr/>'			
		}
	}
	
	return output;
}

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
				content: IndexWrapper({store, labels}),
				imageGallery,
				status: 200
			}
		});
	}
}

const IndexWrapper = ({store, labels}) => {
	
	const {getState} = store;
	const {data} = getState().contentful;
	const websites = data.websites.entries;
	const {homepage} = websites[0];
	const {title, description, content, imageGallery} = homepage || '';
	const RenderGallery = GalleryComponent({data: imageGallery});
	const RenderDescription = (description) ? `<p class="lead">${description}</p>` : '';
	const RenderGrid =  packageGrid({store});
	const RenderContent = (content) ? marked(content) : '';
	const RenderBlog = BlogIndexComponent({store, width: 'full'});
	
	const widget = RightSideWidget({
		entry: homepage,
		labels
	});
	
	const main = (content) ? (widget) ? `
		<div class="row">
			<div class="col-md-8">
				<div class="entry-content entry-fixed-width">${RenderContent}</div>
			</div>
			<div class="col-md-4">
				${widget}
			</div>
		</div>	
	` : `<div class="entry-content entry-full-width">${RenderContent}</div>` : '';
	
	return `
		<div class="container">
			<div class="text-center">
				<div class="mb-5">
					${RenderGallery}
				</div>
				<h1 class="display-6 my-3">${title}</h1>
				<div>${RenderDescription}</div>
			</div>
			<hr/>
			${main}
			${RenderGrid}
			${RenderBlog}
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