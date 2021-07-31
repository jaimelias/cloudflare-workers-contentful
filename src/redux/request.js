export const request = (state = {
	data: {}
}, action) => {
	
	const {type, payload} = action;

    switch (type) {
        case ActionTypes.REQUEST_SUCCESS:
			const {data} = payload;
            return {
				...state,
				data
			};
        default:
            return state;
    }
};

