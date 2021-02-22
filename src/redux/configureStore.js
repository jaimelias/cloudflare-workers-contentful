import { createStore, combineReducers, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import { request } from './request';
import { response } from './response';
import { enqueue } from './enqueue';
import { contentful } from './contentful';
import { template } from './template';
import { hooks } from './hooks';

export const ReduxStore = ({zone}) => {

    let middleware = [thunk];
	
	const zones = ['images', 'static', 'sitemap.xml', 'api'];
	
    if(ENVIRONMENT === 'dev' && LOGGER_ZONE)
    {
		if(LOGGER_ZONE === 'html')
		{
			if(!zones.includes(zone))
			{
				middleware.push(logger);
			}
		}
		else if(LOGGER_ZONE === zone)
		{
			if(zones.includes(zone))
			{
				middleware.push(logger);
			}
		}
		else if(LOGGER_ZONE === 'all')
		{
			middleware.push(logger);
		}
    }

    return createStore(
 
        combineReducers({
			request,
			response,
			enqueue,
			contentful,
			template,
			hooks
        }),
        applyMiddleware(...middleware)
    );
};