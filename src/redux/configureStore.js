import { createStore, combineReducers, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import { request } from './request';
import { response } from './response';
import { enqueue } from './enqueue';
import { contentful } from './contentful';
import { template } from './template';

export const ReduxStore = () => {

    let middleware = [thunk];

    if(ENVIRONMENT === 'dev')
    {
        middleware.push(logger);
    }

    return createStore(
 
        combineReducers({
			request,
			response,
			enqueue,
			contentful,
			template
        }),
        applyMiddleware(...middleware)
    );
};