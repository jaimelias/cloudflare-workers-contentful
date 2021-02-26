import { createStore, combineReducers, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import { request } from './request';
import { response } from './response';
import { enqueue } from './enqueue';
import { contentful } from './contentful';
import { template } from './template';
import { hooks } from './hooks';

export const ReduxStore = ({zone}) => {

	let logger = createLogger();
    let middleware = [thunk];
	let pushByZone = false;
	let pushByAction = false;
	const zones = ['images', 'static', 'sitemap.xml', 'api'];
	
    if(ENVIRONMENT === 'dev')
    {
		if(!LOGGER_ZONES)
		{
			pushByZone = true;
		}
		else
		{
			const splitZones = LOGGER_ZONES.split(',') || [];
			
			if(splitZones.includes(zone) && zones.includes(zone))
			{
				pushByZone = true;
			}
			else if(splitZones.includes('html') && !zones.includes(zone))
			{
				pushByZone = true;
			}
		}

		if(!LOGGER_ACTIONS)
		{
			pushByAction = true;
		}
		else
		{
			const splitActions = LOGGER_ACTIONS.split(',') || [];
			const inActionTypes = (val) => typeof ActionTypes[val] === 'string';
			
			if(splitActions.every(inActionTypes))
			{	
				pushByAction = true;
				logger = createLogger({
					predicate: (getState, action) => splitActions.includes(action.type)
				});
			}
		}
		
		if(pushByZone && pushByAction)
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