import {handleApi} from './src/handlers/handleApi';
import {handleImages} from './src/handlers/handleImages';
import {handleStaticFiles} from './src/handlers/handleStatic';
import {handleSitemap} from './src/handlers/handleSitemap';
import {handleHtml} from './src/handlers/handleHtml';
import {ReduxStore} from './src/redux/configureStore';
import RenderOutput from './src/utilities/render';

const {
	slugRegex, 
	imageFileRegex, 
	parseRequest, 
	validUrlCharacters, 
	isRedirectByCountryOk, 
	getBatchRedirectUrl
} = Utilities;

addEventListener('fetch', event => {
    event.respondWith(firewal({
		request: event.request
	}));
});

const firewal = async ({request}) => {

	const configureStore = ReduxStore();
	const render = new RenderOutput(configureStore);
	const store = {...configureStore, render};
	const {dispatch} = store;
	const {method, url} = request;

	if(!['GET', 'POST'].includes(method))
	{
		return render.payload({status: 405});
	}
	else if(!validUrlCharacters(url))
	{
		return render.payload({status: 400});
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
		
	const entries = await Contentful.getAllEntries({store});
	
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
		return render.payload({status: 302, body: redirectCountryCodesUrl});
	}
	if(batchRedirectUrl)
	{
		return render.payload({status: 301, body: batchRedirectUrl});
	}

	return router({store});
};

const router = async ({store}) => {

	const {dispatch, getState, render} = store;
	
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
			return await handleApi({store});
			break;
		default:
			data =  (pathNameArr.full.some(slugRegex) || !zone) ? await handleHtml({store}) : {status: 400};
	}
			
	if(data)
	{
		return render.payload(data);
	}
}