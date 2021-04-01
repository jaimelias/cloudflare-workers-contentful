const {getFallBackLang, imageFileRegex} = Utilities;

export const handleImages = async ({store}) => {
	
	const {getState, render} = store;
	const {pathName, searchParams, method, pathNameArr} = getState().request.data;
		
	if(method === 'GET' && imageFileRegex(pathName))
	{
		if(searchParams.has('cdnUrl'))
		{
			return render.payload(await getImageByName({store}));
		}
		else if(pathNameArr.full.length === 2)
		{
			return render.payload(await getImageById({store}));
		}
	}
	
	return render.payload({status: 403});
};

const getImageByName = async ({store}) =>  {
	
	
	const {searchParams, pathNameArr} = store.getState().request.data;
	const assetCdnUrl = 'images.ctfassets.net';
		
	if(searchParams.has('cdnUrl'))
	{
		if(searchParams.get('cdnUrl') === assetCdnUrl)
		{			
			let filePath = pathNameArr.full.filter((r, i) => i > 0).join('/');

			return await RenderImage({
				imageUrl: `http://${assetCdnUrl}/${filePath}`, 
				store
			});
		}
		else
		{
			return {status: 400};
		}
	}

	return {status: 404};
};

const getImageById = async ({store}) => {
	
	if(store.getState().request.data.pathNameArr.full.length === 2)
	{
		const image = findImageAsset({store});
		
		if(image)
		{
			return await RenderImage({
				imageUrl: `http:${image.src}`, 
				store
			});
		}
	}
	
	return {status: 404};
};

const RenderImage = async ({imageUrl, store}) => {

	const {pathName, searchParams, headers} = store.getState().request.data;
	const width = (searchParams.has('width')) ? searchParams.get('width') : 0;
	const widthParam = (width) ? `&w=${width}` : '';	
	const isSvg = (pathName.includes('.svg')) ? true : false;
	const thirtyDaysInSeconds = (ENVIRONMENT === 'production') ? 60*60*24*30 : 0;
	imageUrl = (isSvg) ? imageUrl : `${imageUrl}?fm=webp${widthParam}`;
	const imageRequest = new Request(decodeURI(imageUrl), {headers});
	
	let response = await fetch(imageRequest, {
		cf: {
			cacheTtlBystatus: {
				'200-299': thirtyDaysInSeconds, 
				404: 1, 
				'500-599': 0 
			},
			cacheEverything: true
		}
	});	

	if (response.ok)
	{
		let responseHeaders = {};
		
		Array.from(response.headers).forEach(i => {
			if(!i[0].startsWith('x-'))
			{
				if(i[0] === 'cache-control')
				{	
					responseHeaders[i[0]] = `s-${i[1]}`;
				}
				else
				{
					responseHeaders[i[0]] = i[1];
				}
			}
		});
		
		return {
			body: response.body,
			headers: responseHeaders,
			status: 200
		};
	}
	else
	{
		const {status, statusText, headers} = response;

		if(status === 403)
		{
			const body = await response.text();
			
			if(body.includes('hotlinking'))
			{
				return {
					status: 302,
					body: imageUrl
				}
			}		
		}
		
		return {
			status,
			body: statusText
		}
	}
};


const findImageAsset = ({store}) => {
	
	let image = '';
	const {getState} = store;
	const {pathNameArr} = getState().request.data;

	getState().contentful.assets.forEach(a => {					
		const fields = a.fields;
		let title = getFallBackLang(fields.title);
		let file = getFallBackLang(fields.file);
		
		if(decodeURI(file.fileName) === decodeURI(pathNameArr.last))
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

	if(image)
	{
		return image;
	}
	else
	{
		throw new Error('image asset');
	}
};
