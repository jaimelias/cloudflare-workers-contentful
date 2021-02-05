import {handleFormRequest} from './src/handlers/handleApi';
import {handleImages} from './src/handlers/handleImages';
import {htmlRewriter} from './src/utilities/htmlRewriter';
import {handleStaticFiles} from './src/handlers/handleStatic';
import {handleSitemap} from './src/handlers/handleSitemap';
import {handleHtml} from './src/handlers/handleHtml';
import {ReduxStore} from './src/redux/configureStore';

const {
	slugRegex, 
	imageFileRegex, 
	secureHeaders, 
	parseRequest, 
	validUrlCharacters, 
	isRedirectByCountryOk, 
	getBatchRedirectUrl, 
	contentTypeIsHtml
} = Utilities;

addEventListener('fetch', event => {
    event.respondWith(firewal({
		request: event.request
	}));
});

const firewal = async ({request}) => {

	const store = ReduxStore();	
	const {dispatch} = store;
	const {method, url} = request;

	if(!['GET', 'POST'].includes(method))
	{
		dispatch({type: ActionTypes.RESPONSE_METHOD_NOT_ALLOWED});
	}
	else if(!validUrlCharacters(url))
	{
		dispatch({type: ActionTypes.RESPONSE_BAD_REQUEST, payload});
	}
	else
	{
		dispatch({
			type: ActionTypes.REQUEST_SUCCESS, 
			payload: {request, data: parseRequest(request)
		}});		
	}
	
	return connectContentful({store});
};

const connectContentful = async ({store}) => {
		
	const entries = await Contentful.getAllEntries({
		store, 
		altLang: store.getState().request.data.altLang
	});
	
	if(entries.length > 0)
	{
		return redirects({store});
	}
};

const redirects = async ({store}) => {

	const {getState} = store;
	const {headers, hostName, pathName} = getState().request.data;
	const {
		redirectCountryCodes, 
		redirectCountryCodesUrl,
		bypassCountryRedirectIp,
		batchRedirect, 
		siteUrl
	} = getState().contentful.data.websites[0];
	const batchRedirectUrl = getBatchRedirectUrl({pathName, batchRedirect, siteUrl});

	const redirectByCountryOk = isRedirectByCountryOk({
		headers,
		hostName, 
		bypassCountryRedirectIp, 
		redirectCountryCodes
	});

	if(redirectByCountryOk)
	{
		dispatch({type: ActionTypes.RESPONSE_REDIRECT, payload: {
			status: 302,
			body: redirectCountryCodesUrl
		}});
	}
	if(batchRedirectUrl)
	{
		dispatch({type: ActionTypes.RESPONSE_REDIRECT, payload: {
			status: 301,
			body: batchRedirectUrl
		}});
	}

	return router({store});
};

const router = async ({store}) => {

	const {dispatch, getState} = store;
	
	if(!getState().response.isDefault)
	{
		return render({store});
	}
	else
	{
		let data = {};
		const {method, pathName, pathNameArr} = getState().request.data;
		const zone = pathNameArr.first;
		const last = pathNameArr.last;
		
		switch(zone)
		{
			case 'images':
				data = (imageFileRegex(pathName)) ? await handleImages({store}) : {status: 404};	
				break;
			case 'static':
				data = (zone !== last) ? await handleStaticFiles({store}) : {status: 404};
				break;
			case 'sitemap.xml':
				data = (zone === last) ? await handleSitemap({store}) : {status: 400};
				break;
			case 'api':
				data = (last === 'request-form' && method === 'POST') ? await handleFormRequest({store}) : {status: 403};
				break;
			default:
				data =  (pathNameArr.full.some(slugRegex) || !zone) ? await handleHtml({store}) : {status: 400};
		}
		
		if(data)
		{
			const payload = data || {};
			
			switch(data.status)
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
					dispatch({type: ActionTypes.RESPONSE_SERVER});		
			}

			return render({store});	
		}
	}	
}

const render = ({store}) => {
	
	const {body, status, headers} = store.getState().response;
		
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
