import { createStore, combineReducers, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import { response } from './response';
import { enqueue } from './enqueue';

export const ReduxStore = () => {
    const store = createStore(
 
        combineReducers({
			response: response,
			enqueue: enqueue
        }),
        applyMiddleware(thunk, logger)
    );

    return store;
};