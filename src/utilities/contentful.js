const {langList} = LangConfig;
const {stringToHash, getFallBackLang} = Utilities;
const isLinkTypeEntry = (arr) => arr.sys && arr.sys.type === 'Link' && arr.sys.linkType === 'Entry';
const isLinkTypeAsset = (arr) => arr.sys && arr.sys.type === 'Link' && arr.sys.linkType === 'Asset';
export const validContentTypes = ['websites', 'pages', 'posts'];

export const getEntries = async ({contentType, websiteId, store}) => {
	
	let output = {status: 500};
	const KV = await args();
	const init = await getInit({contentType});
	const {dispatch, getState} = store;
	
	if(KV && init)
	{
		const endpoint = getEndPoint({contentType, KV, websiteId});
		const response = await fetch(new URL(endpoint).href, init);
		const altLang = getState().request.data.altLang;
		
		if(response.ok)
		{
			const promise = await response.json();
			const data = (promise) ? parseData({data: promise, altLang, contentType, websiteId}) : {};
			
			if(data.status === 200)
			{
				output = data;
				dispatch({type: ActionTypes.FETCH_CONTENTFUL_SUCCESS, payload: {...data}});
			}
			else
			{
				dispatch({type: ActionTypes.FETCH_CONTENTFUL_FAIL, payload: {...data}});
			}
		}
		else
		{
			output.status = response.status;
			output.statusText = response.statusText;
			
			dispatch({type: ActionTypes.FETCH_CONTENTFUL_FAIL, payload: {status: response.status, statusText: response.statusText}});
		}
	}
	
	return output;
};

const getEndPoint = ({contentType, KV, websiteId}) => {
	const {url, envId, spaceId, token} = KV;
	
	let endpoint = `${url}/spaces/${spaceId}/environments/${envId}/entries?access_token=${token}&content_type=${contentType}&include=3&locale=*`;
	
	if(contentType === 'websites')
	{
		endpoint += `&fields.domainName=${CONTENTFUL_DOMAIN}&limit=1`;
	}
	else
	{
		endpoint += `&links_to_entry=${websiteId}`;
	}
		
	return endpoint;
};

const getInit = async ({contentType}) => {

	const hash = await stringToHash({text: CONTENTFUL_DOMAIN, algorithm: 'SHA-256'});

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
			let thisField = fields[f][currentLanguage] || fields[f][defaultLanguage] || getFallBackLang(fields[f]);
			output[f] = thisField;
		}
	}
	
	return output;
};

const linkField = ({field, assets, entries, currentLanguage, defaultLanguage}) =>{
	
	const args = {
		id: field.sys.id,
		currentLanguage,
		defaultLanguage
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

const linkAsset = ({id, assets, currentLanguage, defaultLanguage}) => {
	const image = assets.find(i => i.sys.id === id);
	
	if(image.fields.hasOwnProperty('file'))
	{
		const fields = image.fields;
		let title = fields.title;
		let file = fields.file;
		
		title = title[currentLanguage] || title[defaultLanguage] || getFallBackLang(title);
		file = file[currentLanguage] || file[defaultLanguage] || getFallBackLang(file);
				
		return {
			fileName: encodeURIComponent(decodeURIComponent(file.fileName)),
			src: file.url,
			title: title,
			width: file.details.image.width,
			height: file.details.image.height,
			type: file.contentType
		};		
	}
};

const parseData = ({data, altLang, contentType, websiteId}) => {

	let output = {
		contentType,
		data: [],
		status: 500, 
		statusText: `error parsing ${contentType}`
	};
	
	if(typeof data === 'object')
	{
		if(data.sys.type === 'Array')
		{
			const items = data.items || [];
			const includes = data.includes || {};
			const assets = includes.Asset || [];
			const entries = includes.Entry || [];
			output.assets = assets;
							
			items.forEach(entry => {
				let fields = entry.fields;
				let defaultLanguage =  '';
				let entryOutput = {id: entry.sys.id};		
				
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
								defaultLanguage = getFallBackLang(findDefLang.fields.defaultLanguage);
							}	
						});
					}
				}
				
				for(let key in fields)
				{
					if(key !== 'websites')
					{
						const currentLanguage = altLang || defaultLanguage;
						let thisField = fields[key][currentLanguage] || fields[key][defaultLanguage] || getFallBackLang(fields[key]);
						
						const fieldArg = {assets, entries, currentLanguage, defaultLanguage, contentType, websiteId};
						
						if(typeof thisField === 'object')
						{
							if(isLinkTypeEntry(thisField) || isLinkTypeAsset(thisField))
							{
								thisField = linkField({...fieldArg, field: thisField});											
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
				if(entryOutput.hasOwnProperty('domainName'))
				{
					entryOutput.siteUrl = new URL(`https://${entryOutput.domainName}`).href;
				}
				
				entryOutput.currentLanguage = altLang || entryOutput.defaultLanguage;
				
				output.data.push(entryOutput);
			});
			
			output.status = 200;
			output.statusText = `${contentType} parsed`;			
		}
	}

	return output;
};

export const getAllEntries = async ({store}) => {

	let entryArgs = {
		store,
		websiteId: ''
	};
	
	return getEntries({...entryArgs, 
		contentType: 'websites'
	})
	.then(async (website) => {

		const entries = validContentTypes
		.filter(i => i !== 'websites')
		.map(contentType => getEntries({
			...entryArgs, 
			contentType,
			 websiteId: website.data[0].id
		}));

		return Promise.all([website, ...entries])
		.then(resp => resp)
		.catch(err => store.render.payload({status: 500, body: err.message}));

	})
	.catch(err => store.render.payload({status: 500, body: err.message}));
};