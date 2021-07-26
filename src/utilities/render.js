import {htmlRewriter} from './htmlRewriter';
const {contentTypeIsHtml, secureHeaders, sortByOrderKey, softRedirectBody, doSoftRedirect, getBypassCacheIps} = Utilities;

export default class RenderOutput {
	constructor({store, event, apiBody})
	{
		this.store = store;
		this.event = event;
		this.apiBody = apiBody;
		this.cache = caches.default;
		this.setCacheKey();
		this.renderCache();
	}
	addHooks(payload){
		this.store.dispatch({type: ActionTypes.ADD_HOOKS, payload: {
			content: payload.content,
			order: payload.order || 50,
			location: payload.location
		}});		
	}
	applyHooks(location) {
		
		let output = '';
		const payload = this.store.getState().hooks || [];
		
		if(typeof payload === 'object')
		{
			if(Array.isArray(payload.content[location]))
			{
				output = payload.content[location]
				.filter(p => typeof p === 'object')
				.filter(p => typeof p.content === 'string')
				.map(p => {
					if(!p.order)
					{
						p.order = 50;
					}
					return p;
				})
				.sort(sortByOrderKey)
				.map(p => p.content)
				.join('\n\t\t')
			}
		}
		
		return output;
	}
	setCacheKey()
	{
		const {request, request: {url, headers}} = this.event;
		const countryCode = headers.get('cf-ipcountry') || '';
		const ip = headers.get('CF-Connecting-IP') || '';
		let cacheUrl = new URL(url);
		cacheUrl.hash = countryCode;		
		this.cacheKey = new Request(cacheUrl.toString(), request);
		this.isBypassedByIp = (ip && getBypassCacheIps.length > 0) 
			? (getBypassCacheIps.includes(ip)) 
			? true 
			: false 
			: false;
	}
	renderCache(){
				
		if(this.isCachedResponse())
		{
			return this.cache.match(this.cacheKey).then(response => response);	
		}
		else
		{
			this.event.waitUntil(this.cache.delete(this.cacheKey));
		}
	}
	payload(payload)
	{
		const {dispatch, getState} = this.store;
		const {hostName, url} = getState().request.data;
		
		if(typeof payload !== 'undefined')
		{
			payload = (typeof payload === 'object') ? payload : {};
			payload.status = payload.status || 500;
			
			const softRedirect = doSoftRedirect({hostName, url, status: payload.status});
			
			if(softRedirect)
			{
				payload = {
					status: 200,
					headers: {
						'content-type': 'text/html;charset=UTF-8'
					},
					body: softRedirectBody(payload.body)
				}
			}
			
			switch(payload.status)
			{
				case 200:
					dispatch({type: ActionTypes.RESPONSE_SUCCESS, payload});
					break;
				case 301:
					dispatch({type: ActionTypes.RESPONSE_REDIRECT, payload});
					break;
				case 302:
					dispatch({type: ActionTypes.RESPONSE_REDIRECT, payload});
					break;			
				case 400:
					dispatch({type: ActionTypes.RESPONSE_BAD_REQUEST, payload});
					break;
				case 403:
					dispatch({type: ActionTypes.RESPONSE_FORBIDDEN, payload});
					break;
				case 404:
					dispatch({type: ActionTypes.RESPONSE_NOT_FOUND, payload});
					break;
				case 405:
					dispatch({type: ActionTypes.RESPONSE_METHOD_NOT_ALLOWED, payload});
					break;
				case 500:
					dispatch({type: ActionTypes.RESPONSE_SERVER, payload});
					break;
				default:
					dispatch({type: ActionTypes.RESPONSE_SERVER, payload});		
			}
		}
		else
		{
			dispatch({
				type: ActionTypes.RESPONSE_SERVER, 
				payload: {
					body: 'internal server error: payload not provided'
				}
			});
		}
		
		return this.response();
	}
	isCachedResponse(){
		if(ENVIRONMENT === 'production' && this.apiBody === false && this.isBypassedByIp === false)
		{
			return true;
		}
		else
		{
			return false;
		}
	}
	response()
	{
		const {getState} = this.store;
		const {fetcher} = getState().contentful;
		const {body, status, headers} = getState().response;
		const isHtml = contentTypeIsHtml({headers});
		let response = '';
		
		if(status === 301 || status === 302)
		{
			return Response.redirect(body, status);
		}
		else
		{
			let responseHeaders = {
				...headers, 
				...secureHeaders,
				'Data-Fetcher': fetcher
			};
				
			let newResponse = new Response(body, {
				status,
				headers: responseHeaders
			});
			
			if(isHtml)
			{
				newResponse = htmlRewriter(this.store).transform(newResponse);
			}
			
			if(status === 200 && this.isCachedResponse())
			{
				if(isHtml)
				{
					newResponse.headers.append('Env-Mode', 'visitor');
				}
				
				this.event.waitUntil(this.cache.put(this.cacheKey, newResponse.clone()));
			}
			else
			{
				if(isHtml)
				{
					newResponse.headers.set('Cache-Control', 's-maxage=10');
					newResponse.headers.append('Env-Mode', 'developer');
				}
				
				this.event.waitUntil(this.cache.delete(this.cacheKey));
			}
			
			return newResponse;
		}
	}
}