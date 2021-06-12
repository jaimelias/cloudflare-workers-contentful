const {langList} = LangConfig;
const {getFallBackLang} = Utilities;
const isLinkTypeEntry = (arr) => arr.sys && arr.sys.type === 'Link' && arr.sys.linkType === 'Entry';
const isLinkTypeAsset = (arr) => arr.sys && arr.sys.type === 'Link' && arr.sys.linkType === 'Asset';
export const validContentTypes = ['websites', 'pages', 'posts', 'packages'];

export const getEntries = async ({contentType, websiteId, store, defaultLanguage}) => {
	
	
	const KV = await args();
	const init = await getInit({contentType});
	const {dispatch, getState} = store;
	
	if(KV && init)
	{	
		const endpoint = getEndPoint({contentType, KV, websiteId});
		const response = await fetch(new URL(endpoint).href, init);
		const {status, statusText} = response;
		
		if(response.ok)
		{
			const data = await response.json();
			
			return {...data, contentType, defaultLanguage};
		}
		else
		{			
			dispatch({type: ActionTypes.FETCH_CONTENTFUL_FAIL, payload: {status, statusText}});
			return {status, statusText};
		}
	}
	
	return {status: 500};
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

	return {
		cf: {
			cacheTtlByresponseStatus: {
				'200-299': 60, 
				'404': -1, 
				'500-599': -1 
			},
			cacheEverything: true,
			cacheKey: `${CONTENTFUL_DOMAIN}/${contentType}`
		}
	};
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
		data: {
			entries: [],
			total: 0
		},
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
			output.data.total = data.total || 0;
			output.data.limit = data.limit || 0;
			output.data.skip = data.skip || 0;
			output.assets = assets;
			output.fetcher = data.fetcher;
							
			items.forEach(entry => {
				let fields = entry.fields;
				const {id, updatedAt, createdAt} = entry.sys;
				const defaultLanguage = (fields.hasOwnProperty('defaultLanguage')) ? Object.values(fields.defaultLanguage)[0] : data.defaultLanguage;
				const currentLanguage = altLang || defaultLanguage;

				let entryOutput = {
					id,
					updatedAt,
					createdAt
				};
				
				for(let key in fields)
				{
					if(key !== 'websites')
					{
						let thisField = fields[key][currentLanguage] || fields[key][defaultLanguage] || getFallBackLang(fields[key]);
						
						const fieldArg = {assets, entries, currentLanguage, defaultLanguage, contentType, websiteId};
						
						if(typeof thisField === 'object')
						{
							if(isLinkTypeEntry(thisField) || isLinkTypeAsset(thisField))
							{
								thisField = linkField({...fieldArg, field: thisField});

								for(let subKey in thisField)
								{
									if(isLinkTypeEntry(thisField[subKey]) || isLinkTypeAsset(thisField[subKey]))
									{
										thisField[subKey] = linkField({...fieldArg, field: thisField[subKey]});
									}
									if(Array.isArray(thisField[subKey]))
									{
										if(thisField[subKey].every(isLinkTypeEntry) || thisField[subKey].every(isLinkTypeAsset))
										{
											thisField[subKey] = mapLinkField({fieldArg, fields: thisField[subKey]});
										}
									}
								}
							}							
						}
						if(Array.isArray(thisField))
						{
							if(thisField.every(isLinkTypeEntry) || thisField.every(isLinkTypeAsset))
							{
								thisField = mapLinkField({fieldArg, fields: thisField});							
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
				
				entryOutput.currentLanguage = currentLanguage || defaultLanguage;
				
				output.data.entries.push(entryOutput);
			});
			
			output.status = 200;
			output.statusText = `${contentType} parsed`;			
		}
	}

	return output;
};

const mapLinkField = ({fieldArg, fields}) => fields.map(item => {
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

const parseKvData = data => {
	let output = false;
	
	if(data)
	{
		try
		{
			if(typeof data === 'string')
			{
				if(data !== null && data !== '')
				{
					data = JSON.parse(data);
					
					if(Array.isArray(data))
					{
						if(data.length > 0)
						{
							output = data;
						}
					}
				}
			}
		}
		catch(e)
		{
			console.log(e);
		}		
	}	
	
	return output;
};

export const getAllEntries = async ({store}) => {
	
	const {getState, dispatch} = store;
	const {waitUntil, altLang} = getState().request.data;
	const kvCacheKey = `cache/${CONTENTFUL_DOMAIN}`;
	const kvCache = await CACHE.get(kvCacheKey);
	let kvData = parseKvData(kvCache);
	
	if(kvData && ENVIRONMENT === 'production')
	{		
		const data = kvData.map(d => {
			d.fetcher = 'KV';
			return d;
		});
				
		const website = data.find(i => i.contentType === 'websites');
		const websiteId = website.items[0].sys.id;
		
		return data.map(d => {
			const contentType = d.contentType;
			const output = parseData({data: d, altLang, contentType, websiteId});
			dispatch({type: ActionTypes.FETCH_CONTENTFUL_SUCCESS, payload: {...output}});
			return output;			
		});
	}
	else
	{
		let entryArgs = {
			store,
			websiteId: ''
		};
		
		return getEntries({...entryArgs, 
			contentType: 'websites',
			defaultLanguage: undefined
		})
		.then(async (website) => {

			const websiteItem = website.items[0];
			const websiteId = websiteItem.sys.id;
			const defaultLanguage = getFallBackLang(websiteItem.fields.defaultLanguage);
						
			const entries = validContentTypes
			.filter(i => i !== 'websites')
			.map(contentType => getEntries({
				...entryArgs, 
				contentType,
				 websiteId,
				 defaultLanguage
			}));
			
			return await Promise.all(entries)
			.then(data => {
				
				data = [website, ...data];
												
				return data.map(async (d) => {
					d = await d;
					d.fetcher = 'fetch';		
					const contentType = d.contentType;
										
					const output = parseData({data: d, altLang, contentType, websiteId});
					dispatch({type: ActionTypes.FETCH_CONTENTFUL_SUCCESS, payload: {...output}});

					if(ENVIRONMENT === 'production')
					{
						waitUntil(CACHE.put(kvCacheKey, JSON.stringify(data), {expirationTtl: 600}));
					}
					else
					{
						waitUntil(CACHE.delete(kvCacheKey));
					}
					
					return output;
				});
			})
			.catch(err => store.render.payload({status: 500, body: err.message}));

		})
		.catch(err => store.render.payload({status: 500, body: err.message}));		
	}
};

export const pageIsBlog = ({slug, website}) => {
	
	if(typeof website.blogPage === 'object')
	{
		if(slug === website.blogPage.slug)
		{
			return true;
		}
	}			
};