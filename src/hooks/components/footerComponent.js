const {isUrl} = Utilities;

export const copyRight = ({siteName}) => (`<div class="mt-5 mb-2 text-center"><span class="text-muted ">${siteName}</span></div>`);

export const FooterMenu = ({telephoneNumber, instagramUsername, location, googleMapsUrl}) => {
	let output = [];
	
	if(typeof location === 'object')
	{
		let addressArr = [];
		
		const {name: locationName, stateProvince, country} = location;

		if(typeof locationName === 'string')
		{
			addressArr.push(location.name);
		}
		if(typeof stateProvince === 'string')
		{
			addressArr.push(stateProvince);
		}

		if(typeof country === 'object')
		{
			const {code: countryCode} = country || '';

			if(countryCode)
			{
				addressArr.push(countryCode);
			}
		}

		if(addressArr.length > 0)
		{
			const addressStr = addressArr.join(', ');

			if(isUrl(googleMapsUrl)){
				output.push(`<div class="col-md py-2"><a href="${googleMapsUrl}" target="_blank" rel="nofollow">${addressStr}</a></div>`);
			}
			else{
				output.push(addressStr);
			}
		}

		if(instagramUsername)
		{
			output.push(`<div class="col-md py-2"><a target="_blank" rel="nofollow" href="https://instagram.com/${instagramUsername}"><span>@${instagramUsername}</span></a></div>`);
		}

		if(telephoneNumber)
		{
			const isoTelephoneNumber= Utilities.isoNumber(telephoneNumber);
			output.push(`<div class="col-md py-2"><a href="tel:${isoTelephoneNumber}"><span>Tel.</span> <span>${telephoneNumber}</span></a></div>`);
		}
	}

	return (output.length > 0) 
		? `<div class="row text-center">${output.join('')}</div>`
		: '';
};

export const ChatButton = ({whatsappNumber, siteName, facebookMessengerUsername, telephoneNumber}) => {

	const {isoNumber} = Utilities;
	const urlEncodedsiteName = encodeURIComponent(siteName);
	const isoWhatsapp = isoNumber(whatsappNumber);
	const isoTelephoneNumber = isoNumber(telephoneNumber);

	let output = '';
	
	if(whatsappNumber || facebookMessengerUsername || telephoneNumber)
	{
		let dropdownItems = '';
		
		if(whatsappNumber)
		{
			dropdownItems += `<a class="dropdown-item" target="_blank" href="https://wa.me/${isoWhatsapp}?text=${urlEncodedsiteName}">Whatsapp</a>`;
		}
		
		if(facebookMessengerUsername)
		{
			dropdownItems += `<a class="dropdown-item" target="_blank" href="https://m.me/${facebookMessengerUsername}">Messenger</a>`;
		}
		
		if(telephoneNumber)
		{
			dropdownItems += `<a class="dropdown-item" href="tel:+${isoTelephoneNumber}">📞 ${telephoneNumber}</a>`;
		}
		
		output = `
			
				<div class="btn-group chat-component dropup position-fixed end-0 bottom-0 me-3 mb-3">
					<button type="button" class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown">💬 Chat</button>
					<div class="dropdown-menu">
						${dropdownItems}
					</div>
				</div>
		`;
	}

	return output;
};

export const Footer = ({website}) => {
	
	const {siteName, whatsappNumber, telephoneNumber, email, instagramUsername, facebookMessengerUsername, location, googleMapsUrl} = website;
	
	const RenderCopyRight = copyRight({
		siteName
	});
	const RenderFooterMenu = FooterMenu({
		whatsappNumber,
		telephoneNumber, 
		email, 
		instagramUsername,
		siteName,
		location,
		googleMapsUrl
	});
	const RenderChatButton = ChatButton({
		whatsappNumber,
		siteName,
		facebookMessengerUsername,
		telephoneNumber
	});
	
	return `
		<div id="footer" class="mt-5" style="background-color: #f8f9fa;">
			<div class="container-fluid">
				<div class="container py-5">
					${RenderFooterMenu}
					${RenderCopyRight}
					${RenderChatButton}
				</div>
			</div>
		</div>
	`;
};