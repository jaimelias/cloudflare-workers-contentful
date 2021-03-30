export const contentful = (state = {
	data: {},
	assets: [],
    status: 500,
	statusText: 'internal server error',
	fetcher: ''
}, action) => {
	
	const {type, payload} = action;
	
    switch (type) {
        case ActionTypes.FETCH_CONTENTFUL_SUCCESS:
			const data = {[payload.contentType]: payload.data};
			const assets = payload.assets.filter(p => !state.assets.find(s => s.sys.id === p.sys.id));

            return {
                ...state,
				data: {...state.data, ...data},
				assets: [...state.assets, ...assets],
				status: 200,
				statusText: `${payload.contentType} OK`,
				fetcher: payload.fetcher
            };
        case ActionTypes.FETCH_CONTENTFUL_FAIL:
			const failStatusText = payload.statusText || state.statusText;
            return {
                ...state,
				status: payload.status || state.status,
				statusText: `${payload.contentType} ${failStatusText}` || state.status
            };
        default:
            return state;
    }
};