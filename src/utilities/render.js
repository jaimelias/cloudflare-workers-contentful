import {htmlRewriter} from './htmlRewriter';
const {contentTypeIsHtml, secureHeaders} = Utilities;

export default class RenderOutput {
	constructor({store, event})
	{
		this.store = store;
		this.event = event;
		this.cache = caches.default;
		this.setCacheKey();
		this.renderCache();
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
		return this.cache.match(this.cacheKey).then(response => response);		
	}
	payload(payload)
	{
		const dispatch = this.store.dispatch;
		
		if(typeof payload !== 'undefined')
		{
			payload = (typeof payload === 'object') ? payload : {};
			payload.status = payload.status || 500;
			
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
		const {body, status, headers} = this.store.getState().response;
		const isHtml = contentTypeIsHtml({headers});
		let response = '';
		
		if(status === 301 || status === 302)
		{
			response = new Response.redirect(body, status);
		}
		else
		{
			const newResponse = new Response(body, {status});
					
			for(let key in headers)
			{
				newResponse.headers.set(key, headers[key])
			}
			
			for(let key in secureHeaders)
			{
				newResponse.headers.set(key, secureHeaders[key])
			}
			
			if(isHtml)
			{
				response = htmlRewriter().transform(newResponse);
				
				if(ENVIRONMENT === 'production' && status === 200)
				{
					response.headers.append('Cache-Control', 'max-age=3600');
					this.event.waitUntil(this.cache.put(this.cacheKey, response.clone()));
				}
			}
			else
			{
				response = newResponse;	
			}
		}

		return response;
	}
}