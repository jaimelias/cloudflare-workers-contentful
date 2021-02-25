export const TopMenuContact = ({website, labels}) => {
	
	const {telephoneNumber} = website;
	const {labelCallUs} = labels;
	let output = (telephoneNumber) ?  `
		<div class="p-3 bg-secondary text-white text-end d-none d-lg-block d-xl-block">
			<div class="container">
				<span class="text-white">${labelCallUs} ${telephoneNumber}</span>
			</div>
		</div>
	` : '';
	
	return output;
};

export const TopMenu = ({website, pages, request, langItems}) => {
	
	const {hostName, homeUrl} = request;
	const menuItems = getMenuItems({website, pages, langItems});
	const {siteName, logoType, actionButtonText, actionButtonUrl} = website;
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

const getMenuItems = ({website, pages, langItems}) => {
	
	let output = [];
	const {currentLanguage, defaultLanguage} = website;
	const langSubmenu = [];
	const currentLanguageName = LangConfig.langLabels[currentLanguage].name;

	if(pages)
	{		
		pages.filter(i => i.addToMenu).forEach(row => {
			output.push({
				order: row.order,
				href: (currentLanguage === defaultLanguage) ? `/${row.slug}` : `/${currentLanguage}/${row.slug}`,
				text: row.shortTitle,
				eventName: row.slug
			}); 
		});
	}
	
	langItems.forEach(row => {
		langSubmenu.push({
			eventName: `change-lang-${row.lang}`,
			...row
		});
	});
		
	output.push({
		order: 100,
		href: `#`,
		text: `🌐 ${currentLanguageName}`,
		eventName: `dropdown-lang`,
		submenu: langSubmenu.filter(i => !i.iscurrentLanguage)
	});	
	
	return output;
		
};