export const template = (state = {
	title: '',
	description: '',
	content: '',
	imageGallery: [],
	status: 500,
}, action) => {
	
	const {type, payload} = action;
	
    switch (type) {
        case ActionTypes.FILTER_TEMPLATE:
            return {...state, ...payload};
        default:
            return state;
    }
};

