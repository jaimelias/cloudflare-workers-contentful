export const template = (state = {
	title: '',
	description: '',
	content: '',
	imageGallery: [],
	status: '',
}, action) => {
	
	const {type, payload} = action;
	
    switch (type) {
        case ActionTypes.FILTER_TEMPLATE:
            return {...state, ...payload};
        default:
            return state;
    }
};

