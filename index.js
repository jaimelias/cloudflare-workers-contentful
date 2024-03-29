import {handleApi} from './src/handlers/handleApi';
import {handleImages} from './src/handlers/handleImages';
import {handleStaticFiles} from './src/handlers/handleStatic';
import {handleSitemap} from './src/handlers/handleSitemap';
import {handleHtml} from './src/handlers/handleHtml';
import {ReduxStore} from './src/redux/configureStore';
import RenderOutput from './src/utilities/render';
import Firewall from './src/utilities/firewall';
import {purgeKv} from './src/utilities/purge';
const {parseRequest, isContentTypeInStore} = Utilities;

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event));
});

const handleRequest = async (event) => {

	const {request} = event;
	const requestData = await parseRequest(event);
	const {pathNameArr: {first}, apiBody, ip} = requestData;
	const configureStore = ReduxStore({zone: first});
	const render = new RenderOutput({store: configureStore, requestData});
	const store = {...configureStore, render};
	const firewall = new Firewall(store).init(request);
	const purge = await purgeKv(event);
	const responseInCache = await render.renderCache();
	
	if(firewall.status !== 200)
	{	
		return render.payload(firewall);
	}

	if(purge.status === 200 || purge.status === 202)
	{
		return render.payload(purge);
	}	
	
	if(responseInCache)
	{
		return responseInCache;
	}

	store.dispatch({type: ActionTypes.REQUEST_SUCCESS, payload: {data: requestData}});
	
	return await connectContentful(store);
};

const connectContentful = async (store) => Contentful.getAllEntries(store)
.then(() =>  {
	
	const {getState, render} = store;
	const {status} = getState().contentful;
	
	if(status === 200)
	{
		return firewallRules(store);
	}
	else
	{
		return render.payload({status, body: 'connecting database'});
	}
});

const firewallRules = async (store) => {

	const firewall = new Firewall(store).rules();

	if(firewall.status !== 200)
	{
		return store.render.payload(firewall);
	}

	return router(store);
};

const router = async (store) => {
	
	const {getState, render} = store;
	const {pathNameArr} = getState().request.data;
	const {websites} = getState().contentful.data;
	const websitesInStore = isContentTypeInStore(websites);

	if(websitesInStore)
	{
		switch(pathNameArr.first)
		{
			case 'images':
				return await handleImages(store);	
			case 'static':
				return await handleStaticFiles(store);
			case 'sitemap.xml':
				return await handleSitemap(store);
			case 'api':
				return await handleApi(store);
			default:
				return await handleHtml(store);
		}
	}

	return render.payload({status: 500});
}