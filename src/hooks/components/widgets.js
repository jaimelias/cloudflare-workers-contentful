export const RightSideWidget = ({entry, labels}) => {
	
	const {amenities, included, notIncluded} = entry;
	const {labelIncluded, labelNotIncluded, labelAmenities} = labels;
	let output = '';
	
	output += RenderList({
		title: labelAmenities,
		icon: '✔️',
		arr: amenities
	});
	
	output += RenderList({
		title: labelIncluded,
		icon: '✔️',
		arr: included
	});
	
	output += RenderList({
		title: labelNotIncluded,
		icon: '❌',
		arr: notIncluded
	});

	return output;
} 

export const RenderList = ({title, arr, icon}) => {
	const list = (Array.isArray(arr)) ? arr
	.map(r => `<li class="list-group-item">${icon} ${r}</li>`)
	.join('') : '';
	
	return (list) ? `<ul class="list-group mb-2"><li class="list-group-item list-group-item-light font-weight-bold">${title}</li>${list}</ul>` : '';
}