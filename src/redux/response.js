export const headers = {'content-type': 'text/plain'};

export const response = (state = {
    body: 'internal server error',
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
				body: payload.body || 'bad request', 
				status: 400, 
				headers: payload.headers || headers,
				isDefault: false
            };
        case ActionTypes.RESPONSE_FORBIDDEN:
            return {
                ...state, 
				body: payload.body || 'forbidden', 
				status: 403, 
				headers: payload.headers || headers,
				isDefault: false
            };
        case ActionTypes.RESPONSE_NOT_FOUND:
            return {
                ...state, 
				body: payload.body || 'resource not found', 
				status: 404, 
				headers: payload.headers || headers,
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
				body: payload.body || 'internal server error', 
				status: 500, 
				headers: payload.headers || headers,
				isDefault: false
            };
        default:
            return state;
    }
};