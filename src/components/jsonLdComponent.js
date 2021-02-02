export const JsonLd = ({siteName, countryCode, location, stateProvince, streetAddress, telephoneNumber, image, priceRange, slug, type, title, coordinates}) => {
	
	let output = '';
	
	const imageUrl = Utilities.MediaSrc(image);
	
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
				"photo": "${imageUrl}",
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