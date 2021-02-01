import {handleHtml} from './handleHtml';
import {handleSitemap} from './handleSitemap';

export const handleContentful = async ({headers, pathNameArr, hostName, pathName, isDev, format, langLabels, store}) => {

	let output = {
		status: 500
	};

	const langList = Object.keys(langLabels);
	const altLang = (pathNameArr.first.length === 2) ? langList.find(i => i === pathNameArr.first) : false;

	//host
	const ip = headers.get('CF-Connecting-IP');
    const country = headers.get('cf-ipcountry');
	
	const args = {
		altLang,
		langList,
		contentType: 'websites'
	};
	
	//contentful
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
			
			const isRedirectBypassed = (Array.isArray(bypassCountryRedirectIp)) ? bypassCountryRedirectIp.includes(ip) : false;
			
			const isCountryRedirect = (Array.isArray(redirectCountryCodes)) ? redirectCountryCodes.includes(country) : false;
					
			if(hostName !== 'example.com' && !isRedirectBypassed && isCountryRedirect && redirectCountryCodesUrl)
			{
				output = {
					body: redirectCountryCodesUrl, 
					status: 302
				};
			}
			else
			{
				const batchRedirectUrl = Utilities.getBatchRedirectUrl({
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
								isDev,
								store
							});
							
							break;
						case 'sitemap':
							output = handleSitemap({ 
								website: (pages) ? {...website, pages: pages.data} : website,
								hostName,
								isDev
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