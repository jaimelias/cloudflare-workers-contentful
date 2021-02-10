export const JsonLd = ({website, slug, title}) => {
	
	const {siteName, countryCode, location, stateProvince, streetAddress, telephoneNumber, imageGallery, priceRange, type, coordinates} = website;
	
	let output = '';
		
	if(!slug)
	{
		output = `
			<script type="application/ld+json">
			{
				"@context": "https://schema.org",
				"@type": "${type}",
				"name": "${siteName}",
				"description": "${title}",
				"address": {
					"@type": "PostalAddress",
					"addressCountry": "${countryCode}",
					"addressLocality": "${location}",
					"addressRegion": "${stateProvince}",
					"streetAddress": "${streetAddress}"
				},
				"geo": {
					"@type": "GeoCoordinates",
					"latitude": ${coordinates.lat},
					"longitude": ${coordinates.lon}
				},
				"telephone": "${telephoneNumber}",
				"photo": "/images/${imageGallery[0].fileName}",
				"starRating": {
					"@type": "Rating",
					"ratingValue": "5"
				},
				"priceRange": "${priceRange}"
			}</script>
		`;		
	}
	
	return output;
};