export const JsonLd = ({website}) => {
	
	let output = '';
	const {siteName, title, countryCode, location, stateProvince, streetAddress, telephoneNumber, imageGallery, priceRange, type, coordinates} = website;
	
	
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
	
	if(typeof imageGallery[0] === 'object')
	{
		ld.photo = `/images/${imageGallery[0].fileName}`;
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
				
	output = `<script type="application/ld+json">${JSON.stringify(ld)}</script>`;	
	
	return output;
};