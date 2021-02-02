import { createStore, combineReducers, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import { response } from './response';
import { enqueue } from './enqueue';
import { contentful } from './contentful';

export const ReduxStore = () => {
    const store = createStore(
 
        combineReducers({
			response,
			enqueue,
			contentful
        }),
        applyMiddleware(thunk, logger)
    );

    return store;
};