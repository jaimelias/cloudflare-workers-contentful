export const htmlRewriter = store => new HTMLRewriter()
.on('a', new aRewriterClass(store))
.on('.entry-content img', new imageRewriterClass())
.on('table', new tableRewriterClass())
.on('table > tbody > tr > td > a', new tableLinkToButtonClass());

class imageRewriterClass
{
  element(element)
  {
    const attribute = element.getAttribute('src');
		
    if(attribute)
	{
		const assetCdnUrl = 'images.ctfassets.net';
		const file = attribute.split('/').filter(i => i);

		if(Array.isArray(file))
		{
			if(file[0] === assetCdnUrl)
			{
				const maxWidth = 768;
				let fileName = new URL('https://' + file.join('/')).pathname;
				fileName = `/images${fileName}`;
				const srcSetRanges = [576, 768, 992, 1200, 1400].filter(i => i <= maxWidth);
				const srcSetItems = (srcSetRanges.length > 0) ? srcSetRanges.map(row => {
					const imageUrl = encodeURI(decodeURI(`${fileName}?cdnUrl=${assetCdnUrl}&width=${row}`));
					return `${imageUrl} ${row}w`
				}).join(',') : false;
				
				element.setAttribute('src', encodeURI(decodeURI(`${fileName}?cdnUrl=${assetCdnUrl}&width=${maxWidth}`)));
				element.setAttribute('loading', 'lazy');
				
				if(srcSetItems)
				{
					element.setAttribute('srcset', srcSetItems);
				}
			}			
		}
    }
  }
};

class tableRewriterClass {
	element(element){
		
		element.setAttribute('class', 'table table-bordered table-striped');
		element.before('<div class="table-responsive">', { html: true });
		element.after('</div>', { html: true });
	};
};

class tableLinkToButtonClass {
	element(element){
		element.setAttribute('class', 'btn btn-success text-light');
		element.setAttribute('role', 'button');
	};	
};

class aRewriterClass {

	constructor(store){
		this.store = store;
	}
	element(element){
		const {hostName} = this.store.getState().request.data;
		const attribute = element.getAttribute('href');
		
		if(Utilities.isUrl(attribute))
		{
			const url = new URL(attribute)

			if(hostName !== url.hostname)
			{
				element.setAttribute('target', '_blank');
				element.setAttribute('rel', 'noopener');
			}
		}
	};	
	
}