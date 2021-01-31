import {htmlTemplate} from '../htmlTemplate';

export const handleHtml = async ({langConfig, currentLanguage, website, hostName, pathName, isDev, store}) => {
	const labels = langConfig[currentLanguage].labels;
	const splitPath = pathName.split('/');
	const slug = splitPath.filter(i => i !== currentLanguage).join('');
	const pageNotFound = is404({
		slug,
		pages: website.pages
	});
	const globalVars = {...website};
	
	return {
		format: 'html',
		pageNotFound,
		status: 200,
		headers: {
			'content-type': 'text/html;charset=UTF-8'
		},
		body: htmlTemplate({
			langConfig,
			currentLanguage,
			globalVars,
			labels,
			slug,
			hostName,
			pathName,
			is404: pageNotFound,
			isDev,
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