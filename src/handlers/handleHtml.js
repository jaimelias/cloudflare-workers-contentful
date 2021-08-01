import {templateHooks} from '../hooks/templateHooks';
const {slugRegex, getBypassCacheIps} = Utilities;

export const handleHtml = async (store) => {
	const {getState, render} = store;
	const {method, pathNameArr} = getState().request.data;
	
	if(method === 'GET' && (pathNameArr.full.some(slugRegex) || !pathNameArr.first))
	{
		return render.payload(await parseHtml(store));
	}
	
	return render.payload({status: 400});
};

const parseHtml = async (store) => {

	const {getState} = store;
	const template = templateHooks(store);
	const {status} = getState().template;
	const {ip} = getState().request.data;
	const isBypassedByIp = (ip && getBypassCacheIps.length > 0) 
		? (getBypassCacheIps.includes(ip)) 
		? true 
		: false 
		: false;	
	let cacheControl = 'no-store';
	let envMode = 'developer';

	if(ENVIRONMENT === 'production' && isBypassedByIp === false)
	{
		cacheControl = 's-maxage=3600';
		envMode = 'visitor';
	}
	
	return {
		status,
		headers: {
			'content-type': 'text/html;charset=UTF-8',
			'Cache-Control': cacheControl,
			'Env-Mode': envMode
		},
		body: template
	};
};