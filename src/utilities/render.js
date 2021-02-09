import {htmlRewriter} from './htmlRewriter';
const {contentTypeIsHtml, secureHeaders} = Utilities;

export default class RenderOutput {
	constructor(store)
	{
		this.store = store;
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
			
		if(status === 301 || status === 302)
		{
			return Response.redirect(body, status);
		}
		else
		{		
			const response = new Response(body, {status});
					
			for(let key in headers)
			{
				response.headers.set(key, headers[key])
			}
			
			for(let key in secureHeaders)
			{
				response.headers.set(key, secureHeaders[key])
			}

			return (contentTypeIsHtml({headers})) ? htmlRewriter().transform(response) : response;		
		}		
	}
}