
const {validUrlCharacters, isUrl} = Utilities;

export default class Firewall {
	constructor(store){
		this.store = store;
	}
	init(request){
		const {method, url} = request;

		if(!['GET', 'POST'].includes(method))
		{
			return {status: 405};
		}
		else if(!validUrlCharacters(url))
		{
			return {status: 400};
		}

		return {status: 200};
	}
	rules()
	{
		const {getState} = this.store;
		const {headers, hostName, pathName, url} = getState().request.data;
		const {siteUrl, firewall} = getState().contentful.data.websites.entries[0];
		const referer = headers.get('Referer') || '';
	
		if(typeof firewall === 'object')
		{
			const {redirectCountryCodes, redirectCountryCodesUrl, bypassCountryRedirectIp, batchRedirect} = firewall;
			
			const redirectByCountryOk = isRedirectByCountryOk({
				headers,
				hostName, 
				bypassCountryRedirectIp, 
				redirectCountryCodes,
				redirectCountryCodesUrl
			});
			
			if(redirectByCountryOk)
			{
				return {status: 302, body: redirectCountryCodesUrl};
				if(ENVIRONMENT === 'production')
				{
					
				}
				else {
					console.log('redirect not available in dev mode');
				}				
			}
	
			const batchRedirectUrl = getBatchRedirectUrl({pathName, batchRedirect, siteUrl, hostName});
	
			if(batchRedirectUrl)
			{
				if(ENVIRONMENT === 'production')
				{
					return {status: 301, body: batchRedirectUrl};
				}
				else {
					console.log('redirect not available in dev mode');
				}				
			}
	
		}
		
		return {status: 200};
	}
};


const getBatchRedirectUrl = ({pathName, batchRedirect, siteUrl}) => {
	let output = '';
	const separatorRegex = /^(.{1,250}[\|])+(.{1,1000})/;

	if(Array.isArray(batchRedirect))
	{
		const find = batchRedirect
		.filter(r => separatorRegex.test(r))
		.map(r => r.split('|')).filter(r => {
			if(Array.isArray(r))
			{
				if(r.length === 2)
				{
					if(typeof r[0] === 'string' && typeof r[1] === 'string')
					{
						return r;
					}								
				}
			}
			
		})
		.map(r => r.map(c => c.trim()))
		.find(i => {

			const item = '/' + i[0];
			
			if(item === pathName)
			{
				return i;
			}
		});
		
		if(find)
		{
			output = (isUrl(find[1])) ? encodeURI(find[1]) : new URL(encodeURIComponent(find[1]), siteUrl).href;
		}
	}
	
	return output;
};


export const isRedirectByCountryOk = ({headers, hostName, bypassCountryRedirectIp, redirectCountryCodes, redirectCountryCodesUrl}) => {
	
	let output = false;
			
	if(isUrl(redirectCountryCodesUrl))
	{
		const ip = headers.get('CF-Connecting-IP');
		const country = headers.get('cf-ipcountry');
		
		if(Array.isArray(redirectCountryCodes) && ip && country)
		{
			const bypassByIp = bypassCountryRedirectIp || [];
			
			if(!bypassByIp.includes(ip) && redirectCountryCodes.includes(country))
			{
				output = true;
			}
		}
	}
	
	return output;
};