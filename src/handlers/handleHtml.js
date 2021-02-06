import {htmlTemplate} from '../htmlTemplate';

export const handleHtml = async ({store}) => {
	const {getState, render} = store;
	
	const {method, pathNameArr} = getState().request.data;
	
	if(method === 'GET' && (pathNameArr.full.some(Utilities.slugRegex) || !pathNameArr.first))
	{
		return render.payload(await parseHtml({store}));
	}
	
	return render.payload({status: 400});
};

const parseHtml = async ({store}) => {
	
	const {getState} = store;
	const {pathName} = getState().request.data;
	const pages = getState().contentful.data.pages;
	const websiteData = getState().contentful.data.websites[0];
	const {currentLanguage} = websiteData;
	
	const splitPath = pathName.split('/');
	const slug = splitPath.filter(i => i !== currentLanguage).join('');
	const pageNotFound = is404({
		slug,
		pages
	});
	
	return {
		status: (pageNotFound) ? 404 : 200,
		headers: {
			'content-type': 'text/html;charset=UTF-8'
		},
		body: htmlTemplate({
			slug,
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