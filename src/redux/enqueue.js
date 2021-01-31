import * as actionTypes from './actionTypes';

export const enqueue = (state = {
	scripts: {}
}, action) => {
    switch (action.type) {
        case actionTypes.ENQUEUE_SCRIPT:
            return {
				...state, 
				scripts: {...state.scripts, ...action.scripts}
			};
        default:
            return state;
    }
};

