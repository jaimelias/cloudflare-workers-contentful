const {Media, isUrl, sortByOrderKey, getAllPageTypes} = Utilities;

export const TopMenu = ({website, labels, langItems}) => {
	
	const {labelCallUs} = labels;
	const {telephoneNumber} = website;
	const renderTelephoneNumber = (telephoneNumber) ? `<span class="navbar-text">${labelCallUs} ${telephoneNumber}</span>` : '';
	const menuItems = getTopMenuItems({website, langItems});
	const topMenuDropdown = NavbarDropdown({menuItems});
	const theme = website.theme || {};
		
	let output = `
		<nav class="navbar navbar-expand ${theme.topBarTextColor ? "topBarTextColor" : "navbar-dark"} ${theme.topBarBackgroundColor ? "topBarBackgroundColor" : "bg-secondary"}">
			<div class="container-fluid">
					${renderTelephoneNumber}
					
					<form class="d-flex">
						${topMenuDropdown}
					</form>
			</div>
		</nav>
	`;
	
	return output;
};

export const MainMenu = ({store, langItems}) => {

	const {getState} = store;
	const {data} = getState().contentful;
	const website = data.websites.entries[0];
	const request = getState().request.data;
	const {hostName, homeUrl} = request;
	const allPageTypes = getAllPageTypes(data);
	const menuItems = getMainMenuItems({website, data: allPageTypes, langItems});
	const {siteName, logoType, currentLanguage, defaultLanguage, contactPage} = website;
	const theme = website.theme || {};
	const RenderLogo = (logoType) ? Media({alt: siteName, maxHeight: 60, ...logoType}) : siteName;	
	const topMenuLi = NavbarLi({menuItems});
	
	let RenderTopMenuForm = () => {
		
		if(typeof contactPage === 'object')
		{
			if(contactPage.hasOwnProperty('slug'))
			{
				const {slug, shortTitle, title} = contactPage;
				
				const actionText = (shortTitle) ? shortTitle : title;
				
				const actionUrl = (currentLanguage === defaultLanguage) 
				? slug 
				: `${currentLanguage}/${slug}`;
				
				return `
					<form class="d-flex">
					<a href="/${actionUrl}" class="btn ${theme.actionButtonBackgroundColor ? "actionButtonBackgroundColor" : "btn-info"} ${theme.actionButtonTextColor ? "actionButtonTextColor" : "text-light"}">${actionText}</a>
				</form>`;				
			}
		}
		
		return '';
	};
	
	const RendermenuItems = `<ul class="navbar-nav me-auto mb-2 mb-lg-0">${topMenuLi}</ul>`;
		
	return `
		<nav class="navbar navbar-expand-lg navbar-${theme.topMenuTone || 'light'} ${theme.topMenuBackgroundColor ? "topMenuBackgroundColor" : "bg-light"}">
			<div class="container-fluid">
				<a class="navbar-brand mb-0 h1 text-uppercase" href="${homeUrl}">${RenderLogo}</a>
				
				<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
				  <span class="navbar-toggler-icon"></span>
				</button>
				<div class="collapse navbar-collapse" id="navbarSupportedContent">
					${RendermenuItems}
					${RenderTopMenuForm()}
				</div>
			</div>
		</nav>	
	`;
};

const getTopMenuItems = ({website, langItems}) => {
	let output = [];
	const langSubmenu = [];
	const {currentLanguage} = website;
	
	langItems.forEach(row => {
		langSubmenu.push({
			eventName: `change-lang-${row.lang}`,
			...row,
			text: row.lang.toUpperCase()
		});
	});
		
	output.push({
		order: 999,
		href: `#`,
		text: `🌐 ${currentLanguage.toUpperCase()}`,
		eventName: `dropdown-lang`,
		submenu: langSubmenu.filter(i => !i.iscurrentLanguage)
	});
	
	return output;
};

const getMainMenuItems = ({website, data}) => {
	
	let output = [];
	const {currentLanguage, defaultLanguage} = website;

	if(data)
	{		
		data.filter(i => i.addToMenu).forEach(row => {
			output.push({
				order: row.order,
				href: (currentLanguage === defaultLanguage) ? `/${row.slug}` : `/${currentLanguage}/${row.slug}`,
				text: row.shortTitle,
				eventName: row.slug
			}); 
		});
	}
	
	return output;
};


export const NavbarLi = ({menuItems}) => {
	
	return menuItems.sort(sortByOrderKey).map((row, i) => {
		
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
	
}


export const NavbarDropdown = ({menuItems}) => {
	
	return menuItems.sort(sortByOrderKey).map((row, i) => {
		
		const hasSubmenu = (row.hasOwnProperty('submenu')) ? true : false;
		const attrTitle = (row.title) ? `title="${row.title}"` : '';
		let Dropdown = '';
		let RenderDropdown = '';

		if(hasSubmenu)
		{
			Dropdown = row.submenu.map(item => {
				return `<li><a class="dropdown-item" href="${item.href}">${item.text}</a></li>`;
			}).join('');
			
			RenderDropdown = `<ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownLanguage">${Dropdown}</ul>`;
		}

		return `<div class="dropdown"><a style="background-color: rgba(0,0,0,0.2);" class="btn text-light dropdown-toggle" ${attrTitle} href="#" role="button" id="dropdownLanguage" data-bs-toggle="dropdown" aria-expanded="false">${row.text}</a>${RenderDropdown}</div>`;
	}).join('');
	
}