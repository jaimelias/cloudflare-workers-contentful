import {handleContactFormRequest} from '../utilities/crm';

export const handleApi = async ({store}) =>
{
	const {getState, render} = store;
	const {method, pathNameArr, apiBody} = getState().request.data;
	
	if(method === 'POST')
	{
		if(pathNameArr.last === 'request-form' && typeof apiBody === 'object')
		{
			return render.payload(await handleContactFormRequest({store}));
		}
	}
	if(method === 'GET')
	{
		if(pathNameArr.last === 'quote-form')
		{
			//do nothing
		}
	}
	
	return render.payload({status: 403});
}		

