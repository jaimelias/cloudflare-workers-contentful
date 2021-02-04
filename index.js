import {handleFormRequest} from './src/handlers/handleApi';
import {handleImages} from './src/handlers/handleImages';
import {htmlRewriter} from './src/handlers/htmlRewriter';
import {handleStaticFiles} from './src/handlers/handleStatic';
import {handleContentful} from './src/handlers/handleContentful';
import {ReduxStore} from './src/redux/configureStore';

const {slugRegex, imageFileRegex, secureHeaders, isUrl, pathNameToArr, parseRequest} = Utilities;

addEventListener('fetch', event => {
    event.respondWith(handleSecurity({
		request: event.request
	}));
});

const handleSecurity = ({request}) => {
	
	const store = ReduxStore();
	const {dispatch} = store;
	
	const validValueRegex =  /^([\w_\-\/#$&()=?¿@,;.:]|%[\w]{2}){0,2000}$/g;
	
	if(!validValueRegex.test(request.url))
	{
		dispatch({type: ActionTypes.RESPONSE_BAD_REQUEST});
	}
	else
	{	
		dispatch({type: ActionTypes.REQUEST_SUCCESS, payload: {request, data: parseRequest(request)}});
	}
		
	return handleRouting({request, store});
};

const handleRouting = async ({request, store}) => {
	
	const {dispatch, getState} = store;

	if(!getState().response.isDefault)
	{
		return Render({store});
	}
	else
	{
		let data = {};
		let status = 500;
		const {url: requestUrl, method, headers, body} = request;
		const url = new URL(requestUrl);
		const {pathname: pathName, searchParams} = url;	
		const hostName = (url.hostname === 'example.com') ? CONTENTFUL_DOMAIN : url.hostname;
		const pathNameArr = pathNameToArr(pathName);
		
		let requestObj = {
			...request,
			hostName,
			pathName,
			searchParams,
			pathNameArr
		};

		if(method === 'GET')
		{
			if(pathNameArr.first === 'images')
			{
				if(imageFileRegex(pathName))
				{	
					data = await handleImages({store});				
				}
			}
			else if(pathNameArr.first === 'static')
			{			
				if(pathNameArr.first !== pathNameArr.last)
				{
					data = await handleStaticFiles({store});				
				}
			}
			else if(pathNameArr.first === 'sitemap.xml' && pathNameArr.last === 'sitemap.xml')
			{				
				data = await handleContentful({format: 'sitemap', store});			
			}
			else
			{	
				if(pathNameArr.full.some(slugRegex) || !pathNameArr.first )
				{
					data =  await handleContentful({format: 'html', store});				
				}
				else
				{
					data.status = 400;
				}
			}
			
			if(['images', 'icons', 'static'].includes(pathNameArr.first))
			{
				if(pathNameArr.first === pathNameArr.last)
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
			
			status = (data.hasOwnProperty('status')) ? data.status : 500;
		}
		else if(method === 'POST')
		{
			if(pathNameArr.first === pathNameArr.last)
			{
				data.status = 403;
			}
			else
			{
				if(pathNameArr.first === 'api' && pathNameArr.last === 'request-form')
				{
					data = await handleFormRequest({store});
				}
			}
			
			status = (data.hasOwnProperty('status')) ? data.status : 500;
		}
		else
		{
			status = 405;
		}		

		dispatchers({dispatch, status, data});
		
		return Render({store});	
	}	
}

const dispatchers = ({dispatch, status, data}) => {
	
	switch(status)
	{
		case 200:
			dispatch({type: ActionTypes.RESPONSE_SUCCESS, payload: {...data}});
			break;
		case 301:
			dispatch({type: ActionTypes.RESPONSE_REDIRECT, payload: {...data}});
			break;
		case 302:
			dispatch({type: ActionTypes.RESPONSE_REDIRECT, payload: {...data}});
			break;			
		case 400:
			dispatch({type: ActionTypes.RESPONSE_BAD_REQUEST, payload: {...data}});
			break;
		case 403:
			dispatch({type: ActionTypes.RESPONSE_FORBIDDEN, payload: {...data}});
			break;
		case 404:
			dispatch({type: ActionTypes.RESPONSE_NOT_FOUND, payload: {...data}});
			break;
		case 405:
			dispatch({type: ActionTypes.RESPONSE_METHOD_NOT_ALLOWED, payload: {...data}});
			break;
		case 500:
			dispatch({type: ActionTypes.RESPONSE_SERVER, payload: {...data}});
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
