export const handleStaticFiles = async (store) => {
	
	const {getState, render} = store;
	const {method, pathNameArr} = getState().request.data;
	
	if(pathNameArr.first !== pathNameArr.last && method === 'GET')
	{
		return render.payload(await parseStaticFiles({store}));
	}
	
	return render.payload({status: 403});
};

const parseStaticFiles = async ({store}) => {
	
	const {getState} = store;
	const {searchParams, hostName, pathNameArr} = getState().request.data;
	const {siteName} = getState().contentful.data.websites.entries[0];	
	const fileName = pathNameArr.last;
	const thirtyDaysInSeconds = (ENVIRONMENT === 'production') ? 60*60*24*30 : 0;

	if(fileName === 'concat' && searchParams.has('files'))
	{		
		const filesSplit = searchParams.get('files').split(',');
		
		if(Array.isArray(filesSplit))
		{
			const mimeType = (filesSplit.every(i => getExtension(i) === getExtension(filesSplit[0]))) ? getExtension(filesSplit[0]) : false;

			if(mimeType)
			{
				const promises = filesSplit.map(async (row) => {
					return await STATIC.get(row);
				});
				
				let concat = await Promise.all(promises);
								
				if(Array.isArray(concat))
				{
					return {
						body: concat.join('\n'),
						status: 200,
						headers: {
							'content-type': mimeType,
							'Cache-Control': `s-maxage=${thirtyDaysInSeconds}`
						}
					};
				}					
			}
			
			return {status: 400};
		}
		
		return {status: 404};
	}
	else
	{
		const file = await STATIC.get(fileName);
		
		if(file)
		{
			const mimeType = getExtension(fileName);
			
			if(mimeType)
			{
				const faviconInitial = file => file.replace('INITIAL', siteName.substring(0, 1).toUpperCase());
				
				return {
					body: (pathNameArr.last === 'favicon.svg') ? faviconInitial(file) : file,
					status: 200,
					headers: {
						'Content-Type': mimeType,
						'Cache-Control': `s-maxage=${thirtyDaysInSeconds}`
					}
				};
			}
			
			return {status: 400};
		}
		
		return {status: 404};
	}
};

const getExtension = (file) => {
	
	let mimeType = false;
	const types = {
		js: 'text/javascript',
		css: 'text/css',
		svg: 'image/svg+xml',
		json: 'application/json',
		map: 'application/json'
	};

	for(let k in types)
	{
		if(file.endsWith(k))
		{
			mimeType = types[k];
		}
	}
	
	return mimeType;
};