import {templateHooks} from '../hooks/templateHooks';

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

	const template = templateHooks({store});
	const {status} = store.getState().template;
	const oneHour = (ENVIRONMENT === 'production') ? 3600 : 0;
	
	return {
		status,
		headers: {
			'content-type': 'text/html;charset=UTF-8',
			'Cache-Control': `s-maxage=${oneHour}`,
		},
		body: template
	};
};