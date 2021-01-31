const isLinkTypeEntry = (arr) => arr.sys && arr.sys.type === 'Link' && arr.sys.linkType === 'Entry';
const isLinkTypeAsset = (arr) => arr.sys && arr.sys.type === 'Link' && arr.sys.linkType === 'Asset';

export const getEntries = async ({altLang, langList, contentType, websiteId}) => {
	
	let output = {
		status: 500
	};
	const KV = await args();
	const CF = await getCf({contentType});
	
	if(KV && CF)
	{
	
		const endpoint = getEndPoint({
			contentType,
			KV,
			websiteId
		});

		const response = await fetch(new URL(endpoint).href, CF);
		
		if(response.ok)
		{
			const data = await response.json();
			const outputData = [];
			
			if(data)
			{
				const items = data.items;
				const includes = data.includes;
				const assets = includes.Asset;
				const entries = includes.Entry;
								
				items.forEach(entry => {
					let fields = entry.fields;
					let defaultLanguage =  '';
					let entryOutput = {};
					
					if(fields.hasOwnProperty('defaultLanguage'))
					{
						defaultLanguage = Object.values(fields.defaultLanguage)[0];
					}
					if(fields.hasOwnProperty('websites'))
					{
						for(let w in fields.websites)
						{
							fields.websites[w].forEach(r => {
								const findDefLang = entries.find(i => i.sys.id === r.sys.id);
								
								if(findDefLang)
								{
									defaultLanguage = Object.values(findDefLang.fields.defaultLanguage)[0];
								}	
							});
						}
					}
					
					for(let key in fields)
					{
						if(key !== 'websites')
						{
							const currentLanguage = altLang || defaultLanguage;
							let thisField = fields[key][currentLanguage] || fields[key][defaultLanguage];
							
							const fieldArg = {
								assets, 
								entries, 
								currentLanguage, 
								defaultLanguage, 
								contentType, 
								websiteId
							};
							
							if(typeof thisField === 'object')
							{
								if(isLinkTypeEntry(thisField) || isLinkTypeAsset(thisField))
								{
									thisField = linkField({
										...fieldArg,
										field: thisField
									});											
								}							
							}
							if(Array.isArray(thisField))
							{
								if(thisField.every(isLinkTypeEntry) || thisField.every(isLinkTypeAsset))
								{
									thisField = thisField.map(item => {
										if(typeof item === 'object')
										{
											if(item.hasOwnProperty('sys'))
											{
												if(item.sys.type === 'Link')
												{
													item = linkField({
														...fieldArg,
														field: item
													});	
												}
											}
										}
										
										return item;
									});									
								}
							}
							
							entryOutput[key] = thisField;
						}
					}
					
					if(!entryOutput.hasOwnProperty('defaultLanguage'))
					{
						entryOutput.defaultLanguage = defaultLanguage;
					}
					
					if(entryOutput.hasOwnProperty('slug'))
					{
						entryOutput.slugs = entry.fields.slug;
					}
					
					entryOutput.assets = assets;
					entryOutput.id = entry.sys.id;
					outputData.push(entryOutput);
				});
			}
			
			if(outputData.length > 0)
			{
				output.status = 200;	
				output.statusText = response.statusText;
				output.data = outputData;
				console.log(outputData);
			}
			else
			{
				output.status = 404;
				output.statusText = `${contentType} not found`;
			}
		}
		else
		{
			output.status = response.status;
			output.statusText = response.statusText;
		}
	}
	
	return output;
};

const getEndPoint = ({contentType, KV, websiteId}) => {
	const {url, envId, spaceId, token} = KV;
	
	let endpoint = `${url}/spaces/${spaceId}/environments/${envId}/entries?access_token=${token}&content_type=${contentType}&include=3&locale=*`;
	
	switch(contentType)
	{
		case 'websites':
			endpoint += `&fields.domainName=${CONTENTFUL_DOMAIN}&limit=1`;
			break;
		case 'pages':
			endpoint += `&links_to_entry=${websiteId}`;
			break;
	}

		
	return endpoint;
};

const getCf = async ({contentType}) => {

	const hash = await Utilities.stringToHash({text: CONTENTFUL_DOMAIN, algorithm: 'SHA-256'});

	if(hash)
	{
		return {
			cf: {
				cacheTtlByresponseStatus: {
					'200-299': 60, 
					'404': -1, 
					'500-599': -1 
				},
				cacheEverything: true,
				cacheKey: `${contentType}_${hash}`
			}
		};
	}
};

const args = async () => {

	const url = 'https://cdn.contentful.com';
	const envId = 'master';
	const spaceId = await CONTENTFUL.get('space_id');
	const token = await CONTENTFUL.get('access_token');

	return {
		url,
		envId,
		spaceId,
		token
	};
};

const linkEntry = ({id, entries, defaultLanguage, currentLanguage}) => {
	
	const entry = entries.find(i => i.sys.id === id);
	const output = {};
	
	if(entry)
	{
		let fields = entry.fields;
		
		for(let f in fields)
		{
			output[f] = fields[f][currentLanguage] || fields[f][defaultLanguage];
		}
	}
	
	return output;
};

const linkField = ({field, assets, entries, currentLanguage, defaultLanguage, contentType, websiteId}) =>{
	
	const args = {
		id: field.sys.id,
		currentLanguage,
		defaultLanguage,
		contentType,
		websiteId
	};
	
	switch(field.sys.linkType)
	{
		case 'Asset':
			field = linkAsset({...args, assets});
			break;
		case 'Entry':
			field = linkEntry({...args, entries});
			break;
	}											
	
	return field;
};

const linkAsset = ({id, assets, currentLanguage, defaultLanguage, contentType, websiteId}) => {
	const image = assets.find(i => i.sys.id === id);
	
	if(image.fields.hasOwnProperty('file'))
	{
		const fields = image.fields;
		let title = fields.title;
		let file = fields.file;
		
		title = title[currentLanguage] || title[defaultLanguage];
		file = file[currentLanguage] || file[defaultLanguage];
				
		return {
			fileName: file.fileName,
			src: file.url,
			title: title,
			width: file.details.image.width,
			height: file.details.image.height,
			type: file.contentType,
			contentType,
			websiteId
		};		
	}
};
