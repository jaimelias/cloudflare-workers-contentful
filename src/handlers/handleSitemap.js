export const handleSitemap = async ({store}) => {
	const {getState, render} = store;	
	const {pathNameArr, method} = getState().request.data;	
	
	if(pathNameArr.first === pathNameArr.last && method === 'GET')
	{
		return render.payload(await SitemapParse(store));
	}
	
	return render.payload({status: 400});
};

const SitemapParse = async (store) => {
	
	let urls = [];
	const langPaths = {};
	const langList = LangConfig.langList;
	let output = {
		status: 404
	};
	const {escUrl} = Utilities;
	const {getState} = store;
	const {defaultLanguage, domainName, homepage} = getState().contentful.data.websites.entries[0];
	const {imageGallery} = homepage;
	const pages = getState().contentful.data.pages.entries;
		
	langList.forEach(key => {
		langPaths[key] = (key === defaultLanguage) ? '' : key;
	});
	
	for(let k in langPaths)
	{
		if(k === defaultLanguage)
		{
			let urlObj = {
				loc: new URL(langPaths[k], `https://${domainName}`).href,
				alternates: [],
				images: []
			};
			
			
			if(Array.isArray(imageGallery))
			{
				imageGallery.forEach(image => {
					const imageUrl = `/images/${image.fileName}`;
					urlObj.images.push(escUrl(new URL(imageUrl, `https://${domainName}`).href));					
				});
			}

			langList.forEach(key => {
				if(key !== defaultLanguage)
				{
					urlObj.alternates.push({
						hreflang: key,
						href: new URL(key, `https://${domainName}`).href
					});
				}
			});
			
			urls.push(urlObj);			
		}
	}
	
	pages.forEach(row => {
		
		const gallery = (row.hasOwnProperty('imageGallery')) ? row.imageGallery : [];
		
		let urlObj = {
			loc: new URL(row.slug, `https://${domainName}`).href,
			alternates: [],
			images: []
		};
		
		for(let s in row.slugs)
		{
			if(s !== defaultLanguage)
			{
				const thisSlug = s + '/' + row.slugs[s];
				urlObj.alternates.push({
					hreflang: s,
					href: new URL(thisSlug, `https://${domainName}`).href
				});
			}	
		}
		
		if(gallery)
		{	
			gallery.forEach(image => {
				urlObj.images.push(escUrl(new URL(`/images/${image.fileName}`, `https://${domainName}`).href));
			});			
		}

		urls.push(urlObj);
	});
	
	if(urls.length)
	{
		return {
			status: 200,
			body: SitemapRender({urls}),
			headers: {
				'content-type': 'application/xml'
			}
		}
	}
	
	return {status: 500};
};

const SitemapRender = ({urls}) => {
		
	const urlSet = urls.map(row => {
		let item = [`\n\t\t<loc>${row.loc}</loc>`];
		const images = row.images.forEach(image => {
			item.push(`\n\t\t<image:image><image:loc>${image}</image:loc></image:image>`);
		});
		
		const alternates = row.alternates.forEach(alternate => {
			item.push(`\n\t\t<xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${alternate.href}" />`);
		});
		
		item = item.join('');
		
		return `\n\t<url>${item}\n\t</url>`;
	}).join('');
		
	return SiteMapLayout({content: urlSet});
};

const SiteMapLayout = ({content}) => (`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${content}\n</urlset>`);