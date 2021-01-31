export const IndexPageComponent = ({title, description, content, image, amenities, included, notIncluded, labelIncluded, labelNotIncluded, labelAmenities}) => {
	
	const RenderMedia = Utilities.Media({
		className: 'img-fluid rounded',
		...image
	});
	
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
					${RenderMedia}
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