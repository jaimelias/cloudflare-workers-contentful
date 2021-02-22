import {htmlRewriter} from './htmlRewriter';
const {contentTypeIsHtml, secureHeaders, sortByOrderKey} = Utilities;
const doSoftRedirect = ({hostName, url, status}) => ((status === 301 || status === 302) && (hostName !== CONTENTFUL_DOMAIN || !url.startsWith('https'))) ? true : false;

export default class RenderOutput {
	constructor({store, event})
	{
		this.store = store;
		this.event = event;
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
		return this.cache.match(this.cacheKey).then(response => response);		
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
				const url = payload.body;

				payload = {
					status: 200,
					headers: {
						'content-type': 'text/html;charset=UTF-8'
					},
					body: `<!doctype html><html><head><meta http-equiv="refresh" content="2;url=${url}" /><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"></head><body><a href="${url}">${url}</a></body></html>`
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
		const {body, status, headers} = this.store.getState().response;
		const isHtml = contentTypeIsHtml({headers});
		let response = '';
		
		if(status === 301 || status === 302)
		{
			response = Response.redirect(body, status);
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