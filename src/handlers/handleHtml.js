import {htmlTemplate} from '../htmlTemplate';

export const handleHtml = async ({currentLanguage, websiteData, hostName, pathName, store}) => {
	const splitPath = pathName.split('/');
	const slug = splitPath.filter(i => i !== currentLanguage).join('');
	const pageNotFound = is404({
		slug,
		pages: websiteData.pages
	});
	const globalVars = {...websiteData};
	
	return {
		status: (pageNotFound) ? 404 : 200,
		headers: {
			'content-type': 'text/html;charset=UTF-8'
		},
		body: htmlTemplate({
			currentLanguage,
			globalVars,
			slug,
			hostName,
			pathName,
			is404: pageNotFound,
			store
		})
	};
};

const is404 = ({slug, pages}) => {
	let output = true;
	
	if(slug)
	{
		if(pages)
		{
			if(pages.find(i => i.slug === slug))
			{
				output = false;
			}
		}
	}
	else
	{
		output = false;
	}
	
	return output;
};