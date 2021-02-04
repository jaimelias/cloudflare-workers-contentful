import {sendGridSend} from '../utilities/sendGridUtilities';
import {formFields} from '../utilities/dataUtilities';

export const handleFormRequest = async ({store}) => {
	
	let output = {
		status: 500
	};
	
	const {langList} = LangConfig;
	const payload = await store.getState().request.request.json();
	
	if(payload)
	{
		if(typeof payload === 'object')
		{	
			let invalids = [];

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
				}
			}
			
			if(invalids.length === 0)
			{
				
				let website = await Contentful.getEntries({
					contentType: 'websites',
					store,
					altLang: false
				}); 
						
				if(website.status === 200)
				{
					website = website.data[0];
					const sendGrid = website.sendGrid;
					
					if(sendGrid)
					{
						const outputPayload = Object.keys(payload)
						.filter(i => formFields[i])
						.reduce((obj, key) => {
							obj[key] = payload[key];
							return obj;						
						}, {});					
						
						output = await sendGridSend({
							payload: outputPayload,
							sendGrid,
							website
						});				
					}
				}
			}
			else
			{
				output.status = 400;
				output.body = 'invalid fields: ' + invalids.join(',');
			}
		}		
	}

	return output;
};