import {htmlRewriter} from './htmlRewriter';
const {contentTypeIsHtml, secureHeaders, sortByOrderKey, softRedirectBody, doSoftRedirect} = Utilities;

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
		let cacheUrl = new URL(url);
		cacheUrl.hash = countryCode;		
		this.cacheKey = new Request(cacheUrl.toString(), request);
	}
	renderCache(){
				
		if(ENVIRONMENT === 'production' && this.apiBody === false)
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
	response()
	{
		const {getState} = this.store;
		const {fetcher} = getState().contentful;
		const {body, status, headers} = getState().response;
		const isHtml = contentTypeIsHtml({headers});
		let response = '';
		
		if(status === 301 || status === 302)
		{
			response = Response.redirect(body, status);
		}
		else
		{
			
			let responseHeaders = {
				...headers, 
				...secureHeaders,
				'Data-Fetcher': fetcher
			};
				
			const newResponse = new Response(body, {
				status,
				headers: responseHeaders
			});
			
			if(isHtml)
			{
				response = htmlRewriter(this.store).transform(newResponse);
			}
			else
			{
				response = newResponse;	
			}
			
			if(ENVIRONMENT === 'production' && status === 200 && this.apiBody === false)
			{
				this.event.waitUntil(this.cache.put(this.cacheKey, response.clone()));
			}
			else
			{
				this.event.waitUntil(this.cache.delete(this.cacheKey));
			}
		}

		return response;
	}
}