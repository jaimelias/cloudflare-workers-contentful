import * as actionTypes from './actionTypes';
export const headers = {'content-type': 'text/plain'};



export const response = (state = {
    body: 'internal server error',
    status: 500,
    format: 'text',
    pageNotFound: false,
	headers: headers,
	isDefault: true
}, action) => {
    switch (action.type) {
        case actionTypes.RESPONSE_SUCCESS:
            return {
                ...state,
				body: action.body,
				status: (action.pageNotFound) ? 404 : 200,
				format: action.format,
				pageNotFound: action.pageNotFound,
				headers: action.headers,
				isDefault: false
            };
        case actionTypes.RESPONSE_REDIRECT:
            return {
                ...state,
				body: action.body,
				status: action.status,
				format: '',
				pageNotFound: false,
				headers: {},
				isDefault: false
            };
        case actionTypes.RESPONSE_BAD_REQUEST:
            return {
                ...state,
				body: action.body || 'bad request', 
				status: 400, 
				format: 'text', 
				pageNotFound: false, 
				headers: action.headers || headers,
				isDefault: false
            };
        case actionTypes.RESPONSE_FORBIDDEN:
            return {
                ...state, 
				body: action.body || 'forbidden', 
				status: 403, 
				format: 'text', 
				pageNotFound: false, 
				headers: action.headers || headers,
				isDefault: false
            };
        case actionTypes.RESPONSE_NOT_FOUND:
            return {
                ...state, 
				body: action.body || 'resource not found', 
				status: 404, 
				format: 'text', 
				pageNotFound: false, 
				headers: action.headers || headers,
				isDefault: false
            };
        case actionTypes.RESPONSE_METHOD_NOT_ALLOWED:
            return {
                ...state, 
				body: 'method not allowed', 
				status: 405, 
				format: 'text', 
				pageNotFound: false, 
				headers: headers,
				isDefault: false
            };
        case actionTypes.RESPONSE_SERVER:
            return {
                ...state, 
				body: action.body || 'internal server error', 
				status: 500, 
				format: 'text', 
				pageNotFound: false, 
				headers: action.headers || headers,
				isDefault: false
            };
        default:
            return state;
    }
};