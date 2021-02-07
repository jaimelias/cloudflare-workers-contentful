import {handleApi} from './src/handlers/handleApi';
import {handleImages} from './src/handlers/handleImages';
import {handleStaticFiles} from './src/handlers/handleStatic';
import {handleSitemap} from './src/handlers/handleSitemap';
import {handleHtml} from './src/handlers/handleHtml';
import {ReduxStore} from './src/redux/configureStore';
import RenderOutput from './src/utilities/render';
import Firewall from './src/utilities/firewall';

const {
	parseRequest,
} = Utilities;

addEventListener('fetch', event => {
    event.respondWith(firewallInit({
		request: event.request
	}));
});


const firewallInit = async ({request}) => {

	const configureStore = ReduxStore();
	const render = new RenderOutput(configureStore);
	const store = {...configureStore, render};
	const firewall = new Firewall(store).init(request);

	if(firewall.status !== 200)
	{
		return render.payload(firewall);
	}
	else
	{
		store.dispatch({
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
		return firewallRules({store});
	}
};

const firewallRules = async ({store}) => {

	const firewall = new Firewall(store).rules();

	if(firewall.status !== 200)
	{
		return store.render.payload(firewall);
	}

	return router({store});
};

const router = async ({store}) => {
		
	switch(store.getState().request.data.pathNameArr.first)
	{
		case 'images':
			return await handleImages({store});	
		case 'static':
			return await handleStaticFiles({store});
		case 'sitemap.xml':
			return await handleSitemap({store});
		case 'api':
			return await handleApi({store});
		default:
			return await handleHtml({store});
	}
}