export const purgeKv = async (event) => {
	
	const {method, headers} = event.request;
	const kvCacheKey = `cache/${CONTENTFUL_DOMAIN}`;
	const cloudflareApiKey = headers.get('Cloudflare-Api-Key') || '';
	const cloudflareEmail = headers.get('Cloudflare-Email') || '';
	const cloudflareZoneId = headers.get('Cloudflare-Zone-Id') || '';
	
	if(method === 'DELETE' && cloudflareApiKey && cloudflareEmail && cloudflareZoneId)
	{
		const endpoint = `https://api.cloudflare.com/client/v4/zones/${cloudflareZoneId}/purge_cache`;

		event.waitUntil(CACHE.delete(kvCacheKey));

		let response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'X-Auth-Email': cloudflareEmail,
				'X-Auth-Key': cloudflareApiKey,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({purge_everything: true})
		});
		
		if(response.ok)
		{
			return {status: 200, body: 'KV and Cache Purged'};
		}
		else
		{
			return {status: 202, body: 'KV Purged'};
		}
	}
	
	return {status: 500, body: 'not purged'};	
}