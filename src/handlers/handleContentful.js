import {handleHtml} from './handleHtml';
import {handleSitemap} from './handleSitemap';

export const handleContentful = async ({headers, pathNameArr, hostName, pathName, format, langLabels, store}) => {

	let output = {
		status: 500
	};

	const {isRedirectByCountryOk, getBatchRedirectUrl} = Utilities;
	const altLang = LangConfig.langList.find(i => i === pathNameArr.first) || false;
	
	const args = {
		altLang,
		contentType: 'websites',
		store
	};
	
	let website = await Contentful.getEntries(args);
	
	if(website.hasOwnProperty('status'))
	{
		if(website.status === 200)
		{
			website = website.data[0];
			website.siteUrl = new URL(`https://${website.domainName}`).href;
			
			const {
				redirectCountryCodes, 
				redirectCountryCodesUrl, 
				bypassCountryRedirectIp,
				batchRedirect,
				siteUrl
			} = website;
			
			const redirectByCountryOk = isRedirectByCountryOk({
				headers,
				hostName, 
				bypassCountryRedirectIp, 
				redirectCountryCodes
			});
					
			if(redirectByCountryOk)
			{
				output = {
					body: redirectCountryCodesUrl, 
					status: 302
				};
			}
			else
			{
				const batchRedirectUrl = getBatchRedirectUrl({
					pathName, 
					batchRedirect,
					siteUrl
				});
				
				if(batchRedirectUrl)
				{
					output =  {
						body: batchRedirectUrl, 
						status: 301
					};
				}
				else
				{

					const pages = await Contentful.getEntries({...args, contentType: 'pages', websiteId: website.id});
					
					switch(format)
					{
						case 'html':
							output = handleHtml({ 
								currentLanguage: altLang || website.defaultLanguage,
								website: (pages) ? {...website, pages: pages.data} : website,
								hostName,
								pathName,
								store
							});
							
							break;
						case 'sitemap':
							output = handleSitemap({ 
								website: (pages) ? {...website, pages: pages.data} : website,
								hostName
							});
							break;
					}
				}
			}
		}
		else
		{
			output.status = website.status;
			output.body = website.statusText;
		}	
	}
	
	return output;
};