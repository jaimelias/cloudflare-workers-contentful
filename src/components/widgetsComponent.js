export const ReservationsComponent = ({actionButtonUrl, actionButtonText}) => {
	
	let output = '';
	
	if(actionButtonUrl && actionButtonText)
	{
		output = `<a class="btn btn-outline-info btn-block" href="${actionButtonUrl}">${actionButtonText}</a>`;

	}
	return output;
};
export const LocationComponent = ({coordinates, googleMapsUrl}) => {
	
	let output = '';
	
	if(googleMapsUrl && coordinates)
	{
		output += `
			<a class="btn btn-outline-info btn-block" href="${googleMapsUrl}" target="_blank">Google Maps 📍</a>
		`;
	}
	
	return output;
};