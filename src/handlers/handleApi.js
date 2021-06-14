import {sendGridSend} from '../utilities/crm';
const {formFields} = SharedData;
const {findBySlug} = Utilities;

export const handleApi = async ({store}) =>
{
	const {getState, render} = store;
	const {method, pathNameArr, apiBody} = getState().request.data;
	
	if(method === 'POST' && pathNameArr.last === 'request-form' && typeof apiBody === 'object')
	{
		return render.payload(await handleFormRequest({store}));
	}
	
	return render.payload({status: 403});
}		

const handleFormRequest = async ({store}) => {
	
	let output = {
		status: 500
	};
	
	let invalids = [];
	const {langList} = LangConfig;
	const {getState} = store;
	const {apiBody: payload} = getState().request.data;
	const {data} = getState().contentful;
	let thisPage = undefined;

	for(let key in formFields)
	{			
		if(!payload.hasOwnProperty(key))
		{
			if(formFields[key].hasOwnProperty('required'))
			{
				invalids.push(key);
			}				
		}
		else
		{
			if(formFields[key].hasOwnProperty('min'))
			{
				if(parseInt(payload[key]) < formFields[key].min)
				{
					invalids.push(key);
				}
			}
			if(formFields[key].hasOwnProperty('max'))
			{
				if(parseInt(payload[key]) > formFields[key].max)
				{
					invalids.push(key);
				}
			}
			if(formFields[key].hasOwnProperty('minLength'))
			{
				if(payload[key].length < formFields[key].minLength)
				{
					invalids.push(key);
				}
			}
			if(formFields[key].hasOwnProperty('maxLength'))
			{
				if(payload[key].length > formFields[key].maxLength)
				{
					invalids.push(key);
				}
			}			

			if(formFields[key].hasOwnProperty('validator'))
			{
				let validator = formFields[key].validator;
				
				if(Utilities.hasOwnProperty(validator))
				{
					validator = Utilities[validator];
					
					if(!validator(payload[key]))
					{
						invalids.push(key);
					}
				}					
			}
			
			if(key === 'language')
			{
				if(!langList.includes(payload[key]))
				{
					invalids.push(key);
				}
			}
			if(key === 'slug')
			{
				thisPage = findBySlug({data, slug: payload[key]}).data;

				if(typeof thisPage === 'undefined')
				{
					invalids.push(key);
				}
			}
		}
	}
	
	if(invalids.length === 0)
	{
		
		const website = data.websites.entries[0];
		const crm = website.crm;
		
		if(crm)
		{					
			const outputPayload = Object.keys(payload)
			.filter(i => formFields[i])
			.reduce((obj, key) => {
				obj[key] = payload[key];
				return obj;						
			}, {});					
			
			output = await sendGridSend({
				payload: outputPayload,
				crm,
				website,
				page: thisPage
			});				
		}
	}
	else
	{
		output.status = 400;
		output.body = 'invalid fields: ' + invalids.join(',');
	}

	return output;
};