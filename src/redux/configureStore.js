import { createStore, combineReducers, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import { request } from './request';
import { response } from './response';
import { enqueue } from './enqueue';
import { contentful } from './contentful';

export const ReduxStore = () => {
    return createStore(
 
        combineReducers({
			request,
			response,
			enqueue,
			contentful
        }),
        applyMiddleware(thunk, logger)
    );
};