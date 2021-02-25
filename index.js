import {handleApi} from './src/handlers/handleApi';
import {handleImages} from './src/handlers/handleImages';
import {handleStaticFiles} from './src/handlers/handleStatic';
import {handleSitemap} from './src/handlers/handleSitemap';
import {handleHtml} from './src/handlers/handleHtml';
import {ReduxStore} from './src/redux/configureStore';
import RenderOutput from './src/utilities/render';
import Firewall from './src/utilities/firewall';

addEventListener('fetch', event => {
    event.respondWith(firewallInit(event));
});

const firewallInit = async (event) => {

	const {request} = event;
	const data = Utilities.parseRequest(event);
	const configureStore = ReduxStore({zone: data.pathNameArr.first});
	const render = new RenderOutput({store: configureStore, event});
	const store = {...configureStore, render};
	const firewall = new Firewall(store).init(request);	
	const responseInCache = await render.renderCache();
		
	if(firewall.status !== 200)
	{	
		return render.payload(firewall);
	}
	
	if(responseInCache)
	{
		return responseInCache;
	}

	store.dispatch({type: ActionTypes.REQUEST_SUCCESS, payload: {request, data}});
	
	return connectContentful({store});
};

const connectContentful = async ({store}) => Contentful.getAllEntries({store}).then(() =>  firewallRules({store}));

const firewallRules = async ({store}) => {

	const firewall = new Firewall(store).rules();

	if(firewall.status !== 200)
	{
		return store.render.payload(firewall);
	}

	return router({store});
};

const router = async ({store}) => {
	
	const {getState, render} = store;

	if(getState().request.hasOwnProperty('data'))
	{
		switch(getState().request.data.pathNameArr.first)
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

	return render.payload({status: 500});	

}