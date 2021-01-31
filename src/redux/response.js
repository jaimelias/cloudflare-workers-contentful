import * as actionTypes from './actionTypes';
export const headers = {'content-type': 'text/plain'};

export const response = (state = {
    body: 'internal server error',
    status: 500,
	headers: headers,
	isDefault: true
}, action) => {
    switch (action.type) {
        case actionTypes.RESPONSE_SUCCESS:
            return {
                ...state,
				body: action.body,
				status: 200,
				headers: action.headers || headers,
				isDefault: false
            };
        case actionTypes.RESPONSE_REDIRECT:
            return {
                ...state,
				body: action.body,
				status: action.status,
				headers: {},
				isDefault: false
            };
        case actionTypes.RESPONSE_BAD_REQUEST:
            return {
                ...state,
				body: action.body || 'bad request', 
				status: 400, 
				headers: action.headers || headers,
				isDefault: false
            };
        case actionTypes.RESPONSE_FORBIDDEN:
            return {
                ...state, 
				body: action.body || 'forbidden', 
				status: 403, 
				headers: action.headers || headers,
				isDefault: false
            };
        case actionTypes.RESPONSE_NOT_FOUND:
            return {
                ...state, 
				body: action.body || 'resource not found', 
				status: 404, 
				headers: action.headers || headers,
				isDefault: false
            };
        case actionTypes.RESPONSE_METHOD_NOT_ALLOWED:
            return {
                ...state, 
				body: 'method not allowed', 
				status: 405, 
				headers: headers,
				isDefault: false
            };
        case actionTypes.RESPONSE_SERVER:
            return {
                ...state, 
				body: action.body || 'internal server error', 
				status: 500, 
				headers: action.headers || headers,
				isDefault: false
            };
        default:
            return state;
    }
};