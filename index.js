import {handleFormRequest} from './src/handlers/handleApi';
import {handleImages} from './src/handlers/handleImages';
import {htmlRewriter} from './src/handlers/htmlRewriter';
import {handleStaticFiles} from './src/handlers/handleStatic';
import {handleContentful} from './src/handlers/handleContentful';
import {ReduxStore} from './src/redux/configureStore';
import * as actionTypes from './src/redux/actionTypes';
import {langConfig} from './src/lang/langConfig';

const {slugRegex, imageFileRegex, secureHeaders, isUrl, isDevMode, pathNameToArr} = Utilities;

addEventListener('fetch', event => {
    event.respondWith(handleSecurity({
		request: event.request
	}))
});

const handleSecurity = async ({request}) => {
	
	const store = {...ReduxStore(), actionTypes};
	const url = new URL(encodeURI(decodeURI(request.url)));
	let isBadRequest = false;
	
	for(let param of url.searchParams)
	{
		const validKeyRegex = /^[\w\d\_\-]{0,25}$/g;
		const validValueRegex =  /^[\w\d\_\-\#\$\%\&\/\(\)\=\?\¿\@\,\;\.\:\s\t\n\r]{0,1000}$/g;
		
		if(!validKeyRegex.test(param[0]))
		{
			isBadRequest = true;
		}
		
		if(!validValueRegex.test(param[1]))
		{
			isBadRequest = true;
		}
	}
	
	if(isBadRequest)
	{
		store.dispatch({type: actionTypes.RESPONSE_BAD_REQUEST});
	}
		
	const requestClone = new Request(url, {
		body: request.body,
		headers: request.headers,
		method: request.method,
		redirect: request.redirect
	});
	
	return handleRouting({
		request: requestClone,
		store
	});
};

const handleRouting = async ({request, store}) => {
	
	let data = {};
	let status = 500;
	const {dispatch, getState, actionTypes} = store;
	const {url: requestUrl, method, headers, body} = request;
	const url = new URL(requestUrl);
	const {pathname: pathName, searchParams} = url;	
	const hostName = (url.hostname === 'example.com') ? CONTENTFUL_DOMAIN : url.hostname;
	const isDev = isDevMode({headers, hostName, isUrl});
	const pathNameArr = pathNameToArr(pathName);
	
	let requestObj = {
		...request,
		hostName,
		pathName,
		searchParams,
		pathNameArr,
		isDev
	};

	if(!getState().response.isDefault)
	{
		return Render({
			response: getState().response
		});
	}
	else
	{
		if(method === 'GET')
		{
			if(pathNameArr.first === 'images')
			{
				if(imageFileRegex(pathName))
				{	
					data = await handleImages({
						requestObj,
						langConfig
					});				
				}
			}
			else if(pathNameArr.first === 'static')
			{			
				if(pathNameArr.first !== pathNameArr.last)
				{				
					data = await handleStaticFiles({
						fileName: pathNameArr.last,
						requestObj
					});				
				}
			}
			else if(pathNameArr.first === 'sitemap.xml' && pathNameArr.last === 'sitemap.xml')
			{				
				data = await handleContentful({
					...requestObj, 
					format: 'sitemap',
					langConfig
				});			
			}
			else
			{	
				if(pathNameArr.full.some(slugRegex) || !pathNameArr.first )
				{
					data =  await handleContentful({
						...requestObj, 
						format: 'html',
						langConfig,
						store
					});				
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
					try
					{
						const payload = await request.json();
						
						if(payload)
						{							
							data = await handleFormRequest({
								payload,
								langConfig
							});	
						}					
					}
					catch(err)
					{
						data.status = 400;
					}
				}
			}
			
			status = (data.hasOwnProperty('status')) ? data.status : 500;
		}
		else
		{
			status = 405;
		}		

		switch(status)
		{
			case 200:
				dispatch({type: actionTypes.RESPONSE_SUCCESS, ...data});
				break;
			case 301:
				dispatch({type: actionTypes.RESPONSE_REDIRECT, ...data});
				break;
			case 302:
				dispatch({type: actionTypes.RESPONSE_REDIRECT, ...data});
				break;			
			case 400:
				dispatch({type: actionTypes.RESPONSE_BAD_REQUEST, ...data});
				break;
			case 403:
				dispatch({type: actionTypes.RESPONSE_FORBIDDEN, ...data});
				break;
			case 404:
				dispatch({type: actionTypes.RESPONSE_NOT_FOUND, ...data});
				break;
			case 405:
				dispatch({type: actionTypes.RESPONSE_METHOD_NOT_ALLOWED, ...data});
				break;
			case 500:
				dispatch({type: actionTypes.RESPONSE_SERVER, ...data});
				break;
		};
		
		return Render({
			store: store
		});	
	}	
}

const Render = ({store}) => {
	
	const {body, format, status, headers} = store.getState().response;
		
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

		return (format === 'html') ? htmlRewriter().transform(response) : response;		
	}	
}
