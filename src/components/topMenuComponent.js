export const TopMenuContact = ({telephoneNumber, labelCallUs}) => {	
	let output = (telephoneNumber) ?  `
		<div class="p-3 bg-secondary text-white text-end d-none d-lg-block d-xl-block">
			<div class="container">
				<span class="text-white">${labelCallUs} ${telephoneNumber}</span>
			</div>
		</div>
	` : '';
	
	return output;
};

export const TopMenu = ({siteName, hostName, logoType, menuItems, homeUrl, actionButtonUrl, actionButtonText}) => {
	
	const {Media, isUrl, sortByOrderKey} = Utilities;
	const RenderLogo = (logoType) ? Media({alt: siteName, maxHeight: 60, ...logoType}) : siteName;
	const topMenuLi = menuItems.sort(sortByOrderKey).map((row, i) => {
		
		const hasSubmenu = (row.hasOwnProperty('submenu')) ? true : false;
		let liClass = (row.liClass) ? row.liClass : '';
		let aClass = 'nav-link';
		const attrTitle = (row.title) ? `title="${row.title}"` : '';
		let subMenuBtn = '';
		let Dropdown = '';
		let RenderDropdown = '';

		if(hasSubmenu)
		{
			liClass = `${liClass} dropdown`;
			aClass = 'nav-link dropdown-toggle';
			subMenuBtn = `id="${row.eventName}Dropdown" data-bs-toggle="dropdown"`;
			Dropdown = row.submenu.map(item => {
				return `<a class="dropdown-item" href="${item.href}">${item.text}</a>`;
			}).join('');
			
			RenderDropdown = `<div class="dropdown-menu">${Dropdown}</div>`;
		}

		return `<li class="nav-item ${liClass}"><a href="${row.href}" ${attrTitle} class="${aClass}" ${subMenuBtn}>${row.text}</a>${RenderDropdown}</li>`;
	}).join('');	
	
	let actionUrl = () => {
		let output = '';
		
		if(actionButtonUrl && actionButtonText)
		{
			if(isUrl(actionButtonUrl))
			{
				let url = new URL(actionButtonUrl);
				output = ((url.hostname === hostName) || url.hostname === CONTENTFUL_DOMAIN) ? `${url.pathname}` : actionButtonUrl;
			}
			else
			{
				output = actionButtonUrl;
			}
		}

		return output;
	};
	
	const RendermenuItems = `<ul class="navbar-nav me-auto mb-2 mb-lg-0">${topMenuLi}</ul>`;
	const RenderTopMenuForm = (actionUrl()) ? `<form class="d-flex"><a href="${actionUrl()}" class="btn btn-info">${actionButtonText}</a></form>` : '';	
	
	
	return `
		<nav class="navbar navbar-expand-lg navbar-light bg-light">
			<div class="container">
				<a class="navbar-brand mb-0 h1 serif text-uppercase" href="${homeUrl}">${RenderLogo}</a>
				
				<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
				  <span class="navbar-toggler-icon"></span>
				</button>
				<div class="collapse navbar-collapse" id="navbarSupportedContent">
					${RendermenuItems}
					${RenderTopMenuForm}
				</div>
			</div>
		</nav>	
	`;
};