export const enqueue = (state = {
	scripts: {}
}, action) => {
    switch (action.type) {
        case ActionTypes.ENQUEUE_SCRIPT:
            return {
				...state, 
				scripts: {...state.scripts, ...action.scripts}
			};
        default:
            return state;
    }
};

