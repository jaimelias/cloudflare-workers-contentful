const {accommodationTypes} = SharedData;
const {findBySlug} = Utilities;

export const RequestForm = ({labels, data, request}) => {
	
	let output = '';

	const {	
		labelStartDate, 
		labelEndDate, 
		labelButtonSubmit,
		labelPax1,
		labelTelephone,
		labelEmail, 
		labelFirstName,
		labelLastName,
		labelMessage,
		formSuccess
	} = labels;

	const {currentLanguage, type} = data.websites.entries[0];
	const thisPage = findBySlug({data, slug: request.slug}).data;
	const {slug} = thisPage;
	let attrClassRow = ' class="row form-row" ';
	let classCol = 'col-md';
	let classMB = 'mb-3';
	const isAccommodationForm = (accommodationTypes.includes(type)) ? true: false;
	const floating = 'class="form-floating mb-3"';
	const fc = 'class="form-control"';
	const fs = 'class="form-select"';
	const attrCol = `class="${classMB} ${classCol}"`;
	const options = [...Array(12)].map((r, i) => {
		const v = i + 1;
		return `<option value="${v}">${v}</option>`;
	}).join('');
	
	const accommodationFields = (isAccommodationForm) ? `
		<div ${attrClassRow}>
			<div ${attrCol}>
				<div ${floating}>
					<select type="number" min="1" ${fs} name="pax1" id="pax1" required>
						${options}
					</select>
					<label for="pax1">${labelPax1}</label>
				</div>
			</div>
			<div class="${classCol}"></div>
		</div>
		
		<div ${attrClassRow}>
			<div ${attrCol}>
				<div ${floating}>
					<input type="text" ${fc} name="startDate" id="startDate" required/>
					<label for="startDate">${labelStartDate}</label>
				</div>
			</div>
			<div ${attrCol}>
				<div ${floating}>
					<input type="text" ${fc} name="endDate" id="endDate" required/>
					<label for="endDate">${labelEndDate}</label>
				</div>
			</div>
		</div>	
	` : '';

	output = `
<form id="request-form" class="needs-validation" novalidate>
	<div class="hidden"><input name="language" id="language" value="${currentLanguage}"/></div>
	<input type="hidden" name="slug" value="${slug}" />
	${accommodationFields}
	
	<div ${attrClassRow}>
		<div ${attrCol}>
			<div ${floating}>
				<input type="text" ${fc} name="firstName" required/>
				<label for="firstName">${labelFirstName}</label>
			</div>
		</div>
		<div ${attrCol}>
			<div ${floating}>
				<input type="text" ${fc} name="lastName" id="lastName" required/>
				<label for="lastName">${labelLastName}</label>
			</div>
		</div>
	</div>
	
	<div ${attrClassRow}>
		<div ${attrCol}>
			<div ${floating}>
				<input type="email" ${fc} name="email" id="email" required/>
				<label for="email">${labelEmail}</label>
			</div>
		</div>
		<div ${attrCol}>
			<div ${floating}>
				<input type="text" ${fc} name="telephone" id="telephone" required/>
				<label for="telephone">${labelTelephone}</label>
			</div>
		</div>
	</div>
	
	<div class="${classMB}">
		<div ${floating}>
			<textarea ${fc} name="message" id="message" required></textarea>
			<label for="message">${labelMessage}</label>
		</div>
	</div>
	
	<button type="submit" class="btn btn-primary submit">${labelButtonSubmit}</button>
	
	<div class="alert alert-danger hidden mt-3">Error</div>
	<div class="alert alert-success hidden mt-3">${formSuccess}</div>	
	
</form>
`;

	
	return output;
};