const {Media, isUrl, sortByOrderKey} = Utilities;

export const TopMenu = ({website, labels, langItems}) => {
	
	const {telephoneNumber} = website;
	const {labelCallUs} = labels;
	const menuItems = getTopMenuItems({website, langItems});
	const topMenuLi = NavbarLi({menuItems});
	
	let output = (telephoneNumber) ?  `
		<nav class="navbar navbar-expand navbar-dark bg-secondary">
			<div class="container">
					<ul class="navbar-nav mr-auto">
						${topMenuLi}
					</ul>
					<span class="navbar-text">${labelCallUs} ${telephoneNumber}</span>
				</div>
			</div>
		</nav>
	` : '';
	
	return output;
};

export const MainMenu = ({website, pages, request, langItems}) => {
	
	const {hostName, homeUrl} = request;
	const menuItems = getMainMenuItems({website, pages, langItems});
	const {siteName, logoType, actionButtonText, actionButtonUrl} = website;
	
	const RenderLogo = (logoType) ? Media({alt: siteName, maxHeight: 60, ...logoType}) : siteName;	
	const topMenuLi = NavbarLi({menuItems});
	
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
	const RenderTopMenuForm = (actionUrl()) ? `<form class="d-flex"><a href="${actionUrl()}" class="btn btn-info text-light">${actionButtonText}</a></form>` : '';	
	
	
	return `
		<nav class="navbar navbar-expand-lg navbar-light bg-light">
			<div class="container">
				<a class="navbar-brand mb-0 h1 text-uppercase" href="${homeUrl}">${RenderLogo}</a>
				
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

const getTopMenuItems = ({website, langItems}) => {
	let output = [];
	const langSubmenu = [];
	const {currentLanguage, defaultLanguage} = website;
	
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

const getMainMenuItems = ({website, pages, langItems}) => {
	
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