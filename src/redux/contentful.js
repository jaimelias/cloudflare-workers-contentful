export const contentful = (state = {
	data: {},
	assets: [],
    status: 500,
	statusText: 'internal server error',
	isDefault: true
}, action) => {
	
	const {type, payload} = action;
	
    switch (type) {
        case ActionTypes.FETCH_CONTENTFUL_SUCCESS:
			const data = {[payload.contentType]: payload.data}
            return {
                ...state,
				data: {...state.data, ...data},
				assets: [...state.assets, ...payload.assets],
				status: 200,
				statusText: `${payload.contentType} OK`
            };
        case ActionTypes.FETCH_CONTENTFUL_FAIL:
			const failStatusText = payload.statusText || state.statusText;
            return {
                ...state,
				data: {},
				assets: [],
				status: payload.status || state.status,
				statusText: `${payload.contentType} ${failStatusText}`
            };
        default:
            return state;
    }
};