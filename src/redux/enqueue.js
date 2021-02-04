export const enqueue = (state = {
	scripts: {}
}, action) => {
	
	const {type, payload} = action;
	
    switch (type) {
        case ActionTypes.ENQUEUE_SCRIPT:
            return {
				...state, 
				scripts: {...state.scripts, ...payload.scripts}
			};
        default:
            return state;
    }
};

