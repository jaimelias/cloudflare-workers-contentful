const {stringToHash, getFallBackLang} = Utilities;

export const handleImages = async ({store}) =>  {
	
	const {getEntries, validContentTypes, getSubEntries} = Contentful;
	const {pathName, hostName, searchParams} = store.getState().request.data;
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
				let image = '';
				let assets = [];
				let assetIds = [];
				const fileName = pathSplit[1];
				let entryArgs = {
					altLang: false,
					store
				};

				const subEntries = await getSubEntries({
					store, 
					altLang: false
				});	
				
				if(subEntries)
				{
					subEntries.forEach(entries => {
						//assets = [...assets, ...entries.assets];

						entries.assets.forEach(a => {
							
							if(!assets.includes(a.sys.id))
							{
								assetIds.push(a.sys.id);
								assets.push(a);								
							}
						});
						
					});
					
					image = getImageByName({
						assets,
						fileName
					});
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
