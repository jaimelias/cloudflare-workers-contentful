const {stringToHash, getFallBackLang} = Utilities;

export const handleImages = async ({store}) =>  {
	
	const {getAllEntries} = Contentful;
	const {pathName, searchParams} = store.getState().request.data;
	const pathSplit = pathName.split('/').filter(i => i);
	const assetCdnUrl = 'images.ctfassets.net';
	let output = {status: 404};
		
	if(Array.isArray(pathSplit))
	{
		if(pathSplit[0] === 'images')
		{
			if (searchParams.has('cdnUrl'))
			{
				if(searchParams.get('cdnUrl') === assetCdnUrl)
				{
					console.log(pathSplit);
					
					let filePath = pathSplit.filter((r, i) => i > 0).join('/');

					output = await RenderImage({
						imageUrl: `http://${assetCdnUrl}/${filePath}`, 
						store
					});
				}
			}
			
			if(pathSplit.length === 2)
			{
				let assets = [];
				const entries = await getAllEntries({store});	
				
				if(entries)
				{
					entries.forEach(e => {assets = [...assets, ...e.assets]});
					const image = getImageByName({assets, fileName: pathSplit[1]});
					
					if(image)
					{
						output = await RenderImage({
							imageUrl: `http:${image.src}`, 
							store
						});
					}					
				}
			}	
		}
	}
		
	return output;
};

const RenderImage = async ({imageUrl, store}) => {
	let output = {
		status: 500
	};
	const {pathName, hostName, searchParams} = store.getState().request.data;
	const width = (searchParams.has('width')) ? searchParams.get('width') : 0;
	const widthParam = (width) ? `&w=${width}` : '';	
	const isSvg = (pathName.includes('.svg')) ? true : false;
	const thirtyDaysInSeconds = (hostName === CONTENTFUL_DOMAIN) ? 60*60*24*30 : 0;
	const hash = await stringToHash({text: `${pathName}?width=${width}`, algorithm: 'SHA-256'});
	imageUrl = (isSvg) ? imageUrl : `${imageUrl}?fm=webp${widthParam}`;
	
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
	else
	{
		output = {
			status: response.status,
			body: response.statusText
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
