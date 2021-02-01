export const handleImages = async ({requestObj, langLabels}) =>  {
	
	const {stringToHash, getFallBackLang} = Utilities;
	const {pathName, isDev, searchParams} = requestObj;
	const width = (searchParams.has('width')) ? searchParams.get('width') : 0;
	const widthParam = (width) ? `&w=${width}` : '';
	const pathSplit = pathName.split('/').filter(i => i);
	const hash = await stringToHash({text: `${pathName}?width=${width}`, algorithm: 'SHA-256'});
	const assetCdnUrl = 'images.ctfassets.net';
	let imageUrl = '';
	const langList = Object.keys(langLabels);
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
			
			if(pathSplit.length === 2 && searchParams.has('contentType'))
			{
				const validContentTypes = ['websites', 'pages'];
				const contentType = searchParams.get('contentType');
				
				if(validContentTypes.includes(contentType))
				{
					const fileName = pathSplit[1];
					
					let entryArgs = {
						langList,
						contentType,
						altLang: false
					};
					
					if(searchParams.has('websiteId'))
					{
						entryArgs.websiteId = searchParams.get('websiteId');
					}
					
					let entries = await Contentful.getEntries(entryArgs);
					
					if(entries.status === 200)
					{
						let assets = false;
						let image = '';
						
						entries.data.forEach(e => {
													
							e.assets.forEach(a => {
								const fields = a.fields;
								let title = fields.title[e.defaultLanguage] || getFallBackLang(fields.title);
								let file = fields.file[e.defaultLanguage] || getFallBackLang(fields.file);
								
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
						});
						
						if(image)
						{
							imageUrl = `http:${image.src}`;
						}				
					}
					
				}
				else
				{
					output.status = 403;
					output.body = 'invalid contentType';
				}
			}

			if(imageUrl)
			{
				imageUrl = (isSvg) ? imageUrl : `${imageUrl}?fm=webp${widthParam}`;

				const thirtyDaysInSeconds = (!isDev) ? 60*60*24*30 : 0;
				
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

export const findCtfImageByName = ({fileName, assets}) => {
	const edge = assets;
	const image = edge.find(i => i.fields.file.fileName === decodeURIComponent(fileName));
	
	if(image)
	{
		
	}
};