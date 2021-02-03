export const contentful = (state = {
	data: {},
	assets: [],
    status: 500,
	statusText: 'internal server error',
	isDefault: true
}, action) => {
    switch (action.type) {
        case ActionTypes.FETCH_CONTENTFUL_SUCCESS:
			const data = {[action.contentType]: action.data}
            return {
                ...state,
				data: {...state.data, ...data},
				assets: [...state.assets, ...action.assets],
				status: 200,
				statusText: `${action.contentType} OK`
            };
        case ActionTypes.FETCH_CONTENTFUL_FAIL:
			const failStatusText = action.statusText || state.statusText;
            return {
                ...state,
				data: {},
				assets: [],
				status: action.status || state.status,
				statusText: `${action.contentType} ${failStatusText}`
            };
        default:
            return state;
    }
};