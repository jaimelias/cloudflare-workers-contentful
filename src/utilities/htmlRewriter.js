export const htmlRewriter = () => {
	return new HTMLRewriter()
	.on('img', new srcRewriterClass({
		attributeName: 'src'
	}))
	.on('table', new tableRewriterClass());
};

class srcRewriterClass
{
  constructor({attributeName})
  {
    this.attributeName = attributeName;
  }
  
  element(element)
  {
    const attribute = element.getAttribute(this.attributeName);
	
    if(attribute)
	{
		const assetCdnUrl = 'images.ctfassets.net';
		const file = attribute.split('/').filter(i => i);

		if(Array.isArray(file))
		{
			if(file[0] === assetCdnUrl)
			{
				const maxWidth = 730;
				let fileName = new URL('https://' + file.join('/')).pathname;
				fileName = `/images${fileName}`;
				const srcSetRanges = [320, 640, 960, 1280, 2560].filter(i => i <= maxWidth);
				const srcSetItems = (srcSetRanges.length > 0) ? srcSetRanges.map(row => {
					const imageUrl = encodeURI(decodeURI(`${fileName}?cdnUrl=${assetCdnUrl}&width=${row}`));
					return `${imageUrl} ${row}w`
				}).join(',') : false;
				
				element.setAttribute(this.attributeName, encodeURI(decodeURI(`${fileName}?cdnUrl=${assetCdnUrl}&width=${maxWidth}`)));
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
		element.setAttribute('class', 'table table-bordered table-striped table-sm');
		element.before('<div class="table-responsive mb-4">', { html: true });
		element.after('</div>', { html: true });
	};
};
