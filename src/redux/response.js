const headers = {'content-type': 'text/plain'};
const err400 = 'bad request';
const err403 = 'forbidden';
const err404 = 'resource not found';
const err500 = 'internal server error';

export const response = (state = {
    body: err500,
    status: 500,
	headers: headers,
	isDefault: true
}, action) => {
	
	const {type, payload} = action;

    switch (type) {
        case ActionTypes.RESPONSE_SUCCESS:
            return {
                ...state,
				body: payload.body,
				status: 200,
				headers: payload.headers || headers,
				isDefault: false
            };
        case ActionTypes.RESPONSE_REDIRECT:
            return {
                ...state,
				body: payload.body,
				status: payload.status,
				headers: {},
				isDefault: false
            };
        case ActionTypes.RESPONSE_BAD_REQUEST:
            return {
                ...state,
				body: (payload) ? (payload.body || err400) : err400, 
				status: 400, 
				headers: (payload) ? (payload.headers || headers) : headers,
				isDefault: false
            };
        case ActionTypes.RESPONSE_FORBIDDEN:
            return {
                ...state, 
				body: (payload) ? (payload.body || err403) : err403, 
				status: 403, 
				headers: (payload) ? (payload.headers || headers) : headers,
				isDefault: false
            };
        case ActionTypes.RESPONSE_NOT_FOUND:
            return {
                ...state, 
				body: (payload) ? (payload.body || err404) : err404, 
				status: 404, 
				headers: (payload) ? (payload.headers || headers) : headers,
				isDefault: false
            };
        case ActionTypes.RESPONSE_METHOD_NOT_ALLOWED:
            return {
                ...state, 
				body: 'method not allowed', 
				status: 405, 
				headers: headers,
				isDefault: false
            };
        case ActionTypes.RESPONSE_SERVER:
            return {
                ...state, 
				body: (payload) ? (payload.body || err500) : err500, 
				status: 500, 
				headers: (payload) ? (payload.headers || headers) : headers,
				isDefault: false
            };
        default:
            return state;
    }
};