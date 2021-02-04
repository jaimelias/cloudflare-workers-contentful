export const request = (state = {
	request: {},
	data: {}
}, action) => {
	
	const {type, payload} = action;
	
    switch (type) {
        case ActionTypes.REQUEST_SUCCESS:
            return {
				...state, 
				request: payload.request,
				data: payload.data
			};
        default:
            return state;
    }
};

