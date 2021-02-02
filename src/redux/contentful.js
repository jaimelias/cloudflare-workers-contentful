export const contentful = (state = {
    data: [],
	assets: [],
    status: 500,
	statusText: 'internal server error',
	isDefault: true
}, action) => {
    switch (action.type) {
        case ActionTypes.FETCH_CONTENTFUL_SUCCESS:
            return {
                ...state,
				data: action.data,
				assets: action.assets,
				status: 200,
				statusText: 'OK'
            };
        case ActionTypes.FETCH_CONTENTFUL_FAIL:
            return {
                ...state,
				data: [],
				assets: [],
				status: action.status || state.status,
				statusText: action.statusText || state.statusText
            };
        default:
            return state;
    }
};