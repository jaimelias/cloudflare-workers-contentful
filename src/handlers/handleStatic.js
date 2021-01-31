export const handleStaticFiles = async ({fileName, requestObj, errorNotFound}) => {
	
	let fileOk = false;
	const {isDev, request, searchParams, hostName, pathNameArr} = requestObj;
	
	const thirtyDaysInSeconds = (!isDev) ? 60*60*24*30 : 0;

	let output = {
		status: 404
	};
	
	if(fileName === 'concat')
	{		
		if(searchParams.has('files'))
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
						concat = concat.join('\n');
						output.body = concat;
						output.status = 200;
						output.headers = {
							'content-type': mimeType
						};
					}					
				}
			}
		}	
	}
	else
	{
		const file = await STATIC.get(fileName);
		
		if(file)
		{
			if(file !== '')
			{				
				const mimeType = getExtension(fileName);
				
				if(mimeType)
				{
					const faviconInitial = file => file.replace('INITIAL', hostName.substring(0, 1).toUpperCase());
					
					output.body = (pathNameArr.last === 'favicon.svg') ? faviconInitial(file) : file;
					output.status = 200;
					output.headers = {
						'content-type': mimeType
					};
				}
			}
		}
	}
	
	if(output.status === 200)
	{
		output.headers['Cache-Control'] = `max-age=${thirtyDaysInSeconds}`;
	}


	return output;
};

export const getExtension = (file) => {
	
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