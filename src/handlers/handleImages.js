const {stringToHash, getFallBackLang} = Utilities;

export const handleImages = async ({requestObj, store}) =>  {
	
	const {pathName, hostName, searchParams} = requestObj;
	const width = (searchParams.has('width')) ? searchParams.get('width') : 0;
	const widthParam = (width) ? `&w=${width}` : '';
	const pathSplit = pathName.split('/').filter(i => i);
	const hash = await stringToHash({text: `${pathName}?width=${width}`, algorithm: 'SHA-256'});
	const assetCdnUrl = 'images.ctfassets.net';
	let imageUrl = '';
	const isSvg = (pathName.includes('.svg')) ? true : false;
		
	let output = {
		status: 404
	};
		
	if(Array.isArray(pathSplit))
	{
		if(pathSplit[0] === 'images' && hash)
		{
			if (searchParams.has('cdnUrl'))
			{
				if(searchParams.get('cdnUrl') === assetCdnUrl)
				{
					let filePath = [...pathSplit];
					filePath.shift();
					filePath = filePath.join('/');
					imageUrl = `http://${assetCdnUrl}/${filePath}`;
				}
			}
			
			if(pathSplit.length === 2)
			{
				const validContentTypes = ['websites', 'pages'];
				const fileName = pathSplit[1];
				let entryArgs = {
					altLang: false,
					store
				};
				let image = '';
				
				if(searchParams.has('contentType'))
				{
					const contentType = searchParams.get('contentType');
					entryArgs.contentType = contentType;
					
					
					if(validContentTypes.includes(contentType))
					{
						if(searchParams.has('websiteId'))
						{
							entryArgs.websiteId = searchParams.get('websiteId');
						}
						
						const data = await Contentful.getEntries(entryArgs);
						
						if(data.status === 200)
						{
							image = getImageByName({
								assets: data.assets, 
								fileName
							});			
						}
					}				
				}
				else
				{
					//delete this else on april
					//this is a temporary fix for urls with no contentType and websiteId params
					const websites = await Contentful.getEntries({
						...entryArgs, 
						contentType: 'websites'
					});
					
					if(websites.status === 200)
					{						
						image = getImageByName({
							assets: websites.assets,
							fileName
						});	
						
						if(!image)
						{
							let assets = websites.assets;
							let websitesIds = websites.data.map(w => w.id);
							
							const websitesPromise = websitesIds.map(async (id) => {
																			
								const dataPromise = validContentTypes.filter(i => i !== 'websites').map(async (i) => {
									
									return await Contentful.getEntries({
										...entryArgs, 
										contentType: i,
										websiteId: id
									});
								});
								
								return await Promise.all(dataPromise);
							});
							
							const resolvedPromise = await Promise.all(websitesPromise);	
							
							if(resolvedPromise)
							{
								resolvedPromise.forEach(r1 => {
									r1.forEach(r2 => {
										assets = [...assets, ...r2.assets];
									});
								});
								
								image = getImageByName({
									assets,
									fileName
								});
							}
						}
					}
					//delete until here
				}
				
				if(image)
				{
					imageUrl = `http:${image.src}`;
				}	
			}

			if(imageUrl)
			{
				imageUrl = (isSvg) ? imageUrl : `${imageUrl}?fm=webp${widthParam}`;

				const thirtyDaysInSeconds = (hostName === CONTENTFUL_DOMAIN) ? 60*60*24*30 : 0;
				
				let response = await fetch(decodeURI(imageUrl), {
					cf: {
						cacheTtlBystatus: {
							'200-299': thirtyDaysInSeconds, 
							404: 1, 
							'500-599': 0 
						},
						cacheEverything: true,
						cacheKey: hash
					}
				});
				
				if(response)
				{	
					if (response.ok) 
					{
						output = {
							body: response.body,
							headers: {
								'Cache-Control': `max-age=${thirtyDaysInSeconds}`,
								'content-type': (isSvg) ? 'image/svg+xml' : 'image/webp'
							},
							status: 200
						};
					}					
				}
			}		
		}
	}
	
	
		
	return output;
};

const getImageByName = ({assets, fileName}) => {
	
	let image = '';
		
	assets.forEach(a => {					
		const fields = a.fields;
		let title = getFallBackLang(fields.title);
		let file = getFallBackLang(fields.file);
		
		if(decodeURI(file.fileName) === decodeURI(fileName))
		{									
			image = {
				fileName: file.fileName,
				src: file.url,
				title: title,
				width: file.details.image.width,
				height: file.details.image.height,
				type: file.contentType
			};
		}
	});

	return image;
};
