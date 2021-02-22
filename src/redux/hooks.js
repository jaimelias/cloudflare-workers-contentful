export const hooks = (state = {
	content: {}
}, action) => {

	const {type, payload} = action;
	 
    switch (type) {
        case ActionTypes.ADD_HOOKS:
            return {
				...state,
				content: pushToState(state.content, payload)
			};
        default:
            return state;
    }
};

const pushToState = (content, payload) => {
	
	if(typeof content[payload.location] === 'undefined')
	{
		content[payload.location] = [];
	}
	
	content[payload.location].push(payload);
	
	return content;
}