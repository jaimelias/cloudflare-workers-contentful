import {htmlRewriter} from './htmlRewriter';
const {contentTypeIsHtml, secureHeaders, sortByOrderKey, softRedirectBody, doSoftRedirect, getBypassCacheIps} = Utilities;

export default class RenderOutput {
	constructor({store, requestData})
	{
		this.store = store;
		this.requestData = requestData;
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
		
		const {ip, event, headers, country} = this.requestData;
		const {request} = event;
		
		let cacheUrl = new URL(request.url);
		cacheUrl.hash = country;		
		this.cacheKey = new Request(cacheUrl.toString(), request);
		this.isBypassedByIp = (ip && getBypassCacheIps.length > 0) 
			? (getBypassCacheIps.includes(ip)) 
			? true 
			: false 
			: false;
	}
	renderCache(){
		
		const {event} = this.requestData;
		
		if(this.isCachedResponse())
		{
			return this.cache.match(this.cacheKey).then(response => response);	
		}
		else
		{
			event.waitUntil(this.cache.delete(this.cacheKey));
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
		
		const {apiBody} = this.requestData;
		
		if(ENVIRONMENT === 'production' && apiBody === false && this.isBypassedByIp === false)
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
		const {event} = this.requestData;
		const isHtml = contentTypeIsHtml(headers);
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
				event.waitUntil(this.cache.put(this.cacheKey, newResponse.clone()));
			}
			else
			{
				event.waitUntil(this.cache.delete(this.cacheKey));
			}
			
			return newResponse;
		}
	}
}