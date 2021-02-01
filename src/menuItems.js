export const getMenuItems = ({pages, langItems, currentLanguage, defaultLanguage}) => {
	
	let output = [];
	
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