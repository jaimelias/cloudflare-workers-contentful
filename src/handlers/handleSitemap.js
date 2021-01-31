export const handleSitemap = async ({langConfig, website, hostName}) => {
	
	let urls = [];
	const langPaths = {};
	const langList = Object.keys(langConfig);
	let output = {
		status: 404
	};
	const {MediaSrc, escUrl} = Utilities;
	
	langList.forEach(key => {
		langPaths[key] = (key === website.defaultLanguage) ? '' : key;
	});
	
	for(let k in langPaths)
	{
		if(k === website.defaultLanguage)
		{
			let urlObj = {
				loc: new URL(langPaths[k], `https://${hostName}`).href,
				alternates: [],
				images: []
			};
			
			if(website.image.hasOwnProperty('fileName'))
			{
				const imageUrl = MediaSrc(website.image);
				urlObj.images.push(escUrl(new URL(imageUrl, `https://${hostName}`).href));
			}
			
			langList.forEach(key => {
				if(key !== website.defaultLanguage)
				{
					urlObj.alternates.push({
						hreflang: key,
						href: new URL(key, `https://${hostName}`).href
					});
				}
			});
			
			urls.push(urlObj);			
		}
	}
	
	website.pages.forEach(row => {
		
		const imageGallery = (row.hasOwnProperty('imageGallery')) ? row.imageGallery : [];
		
		let urlObj = {
			loc: new URL(row.slug, `https://${hostName}`).href,
			alternates: [],
			images: []
		};
		
		for(let s in row.slugs)
		{
			if(s !== website.defaultLanguage)
			{
				const thisSlug = s + '/' + row.slugs[s];
				urlObj.alternates.push({
					hreflang: s,
					href: new URL(thisSlug, `https://${hostName}`).href
				});
			}	
		}
		
		if(imageGallery)
		{	
			imageGallery.forEach(image => {
				urlObj.images.push(escUrl(new URL(MediaSrc(image), `https://${hostName}`).href));
			});			
		}
		
		
		urls.push(urlObj);
	});
	
	if(urls.length)
	{
		output.status = 200;
		output.body = RenderSitemap({urls});
		output.headers = {
			'content-type': 'application/xml'
		};
	}
	
	return output;
};

export const RenderSitemap = ({urls}) => {
		
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

export const SiteMapLayout = ({content}) => (`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${content}\n</urlset>`);