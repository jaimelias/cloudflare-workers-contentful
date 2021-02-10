const err400 = 'bad request';
const err403 = 'forbidden';
const err404 = 'resource not found';
const err405 = 'method not allowed';
const err500 = 'internal server error';

export const response = (state = {
    body: err500,
    status: 500,
	headers: {'content-type': 'text/plain'}
}, action) => {
	
    const type = action.type;
    const payload = action.payload || {};

    switch (type) {
        case ActionTypes.RESPONSE_SUCCESS:
            return {
                ...state,
				body: payload.body,
				status: 200,
				headers: payload.headers || state.headers
            };
        case ActionTypes.RESPONSE_REDIRECT:
            return {
                ...state,
				body: payload.body,
				status: payload.status,
				headers: {}
            };
        case ActionTypes.RESPONSE_BAD_REQUEST:
            return {
                ...state,
				body: payload.body || err400, 
				status: 400, 
				headers: payload.headers || state.headers
            };
        case ActionTypes.RESPONSE_FORBIDDEN:
            return {
                ...state, 
				body: (payload.body) ? `${err403}: ${payload.body}` : err403, 
				status: 403, 
				headers: payload.headers || state.headers
            };
        case ActionTypes.RESPONSE_NOT_FOUND:
            return {
                ...state, 
				body: (payload.body) || err404,
				status: 404, 
				headers: payload.headers || state.headers
            };
        case ActionTypes.RESPONSE_METHOD_NOT_ALLOWED:
            return {
                ...state, 
				body: (payload.body) ? `${err405}: ${payload.body}` : err405, 
				status: 405
            };
        case ActionTypes.RESPONSE_SERVER:
            return {
                ...state, 
				body: (payload.body) ? `${err500}: ${payload.body}` : err500, 
				status: 500, 
				headers: payload.headers || state.headers
            };
        default:
            return state;
    }
};