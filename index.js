import {handleFormRequest} from './src/handlers/handleApi';
import {handleImages} from './src/handlers/handleImages';
import {htmlRewriter} from './src/utilities/htmlRewriter';
import {handleStaticFiles} from './src/handlers/handleStatic';
import {handleContentful} from './src/handlers/handleContentful';
import {ReduxStore} from './src/redux/configureStore';

const {slugRegex, imageFileRegex, secureHeaders, parseRequest, validUrlCharacters} = Utilities;

addEventListener('fetch', event => {
    event.respondWith(handleFirewall({
		request: event.request
	}));
});

const handleFirewall = ({request}) => {

	const store = ReduxStore();	
	const {dispatch} = store;
	const {method, url} = request;

	if(!['GET', 'POST'].includes(method))
	{
		resDispatch({dispatch, status: 405});
	}
	else if(!validUrlCharacters(url))
	{
		resDispatch({dispatch, status: 400});
	}
	else
	{
		dispatch({
			type: ActionTypes.REQUEST_SUCCESS, 
			payload: {request, data: parseRequest(request)
		}});		
	}
	
	return handleRouting({store});
};

const handleRouting = async ({store}) => {

	
	const {dispatch, getState} = store;
	
	if(!getState().response.isDefault)
	{
		return Render({store});
	}
	else
	{
		let status = 500;
		let data = {};
		const {method, pathName, pathNameArr} = getState().request.data;
		const zone = pathNameArr.first;
		const last = pathNameArr.last;
		
		if(zone === 'images' && imageFileRegex(pathName))
		{
			data = await handleImages({store});	
		}
		else if(zone === 'static' && zone !== last)
		{			
			data = await handleStaticFiles({store});
		}
		else if(zone === 'sitemap.xml' && last === 'sitemap.xml')
		{				
			data = await handleContentful({format: 'sitemap', store});			
		}
		else if(['images', 'static'].includes(zone))
		{
			if(zone === last)
			{
				data.status = 403;
			}
			else
			{
				if(!data.hasOwnProperty('status'))
				{
					data.status = 404;
				}				
			}
		}
		else if(zone === 'api')
		{
			if(last === 'request-form' && method === 'POST')
			{
				data = await handleFormRequest({store});
			}
			else
			{
				data.status = 403;
			}
		}
		else
		{	
			if(pathNameArr.full.some(slugRegex) || !zone )
			{
				data =  await handleContentful({format: 'html', store});				
			}
			else
			{
				data.status = 400;
			}
		}
		
		status = data.status || status;	
		resDispatch({dispatch, status, data});	
		return Render({store});			
	}	
}

const resDispatch = ({dispatch, status, data}) => {
	
	const payload = data || {};
	
	switch(status)
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
	};	
}

const Render = ({store}) => {
	
	const {body, status, headers} = store.getState().response;
		
	if(status === 301 || status === 302)
	{
		return Response.redirect(body, status);
	}
	else
	{		
		const response = new Response(body, {
			status
		});
				
		for(let key in headers)
		{
			response.headers.set(key, headers[key])
		}
		
		for(let key in secureHeaders)
		{
			response.headers.set(key, secureHeaders[key])
		}

		return (Utilities.contentTypeIsHtml({headers})) ? htmlRewriter().transform(response) : response;		
	}	
}
