const {langLabels, langList} = LangConfig;

export const formatDate = ({date, lang}) => {
	const d = new Date(date);
	const months = langLabels[lang].labels.months;
		
	return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

export const pageHasForm = ({website, request}) => {
	
	let output = false;
	const {actionButtonText, actionButtonUrl} = website;
	const {hostName, slug} = request;
	
	if(actionButtonText && actionButtonUrl)
	{
		if(isUrl(actionButtonUrl))
		{
			const actionUrl = new URL(actionButtonUrl);
			const actionUrlHostName = actionUrl.hostname;
			const actionUrlPathName = actionUrl.pathname.split('/').filter(i => i).filter(i =>  !langList.includes(i)).join('/');
			
			if((hostName === actionUrlHostName || CONTENTFUL_DOMAIN === actionUrlHostName) && actionUrlPathName === slug)
			{
				output = true;
			}
		}
	}
	
	return output;
};

export const Favicon = ({website}) => {
	
	const {favicon} = website;
	
	const faviconObj = (favicon) ? {
		type: favicon.type, 
		href: `/images/${favicon.fileName}`
	} : {
		type: 'image/svg+xml', 
		href: '/static/favicon.svg'
	};
	
	return `<link rel="icon" type="${faviconObj.type}" href="${faviconObj.href}" sizes="any">`;
};


export const escUrl = (str) => {
	return encodeURI(decodeURI(str).replace(/[&]/g, i => '&amp;'));	
};

export const Media = (obj) => {
	if(obj)
	{
		if(obj.hasOwnProperty('fileName') && obj.hasOwnProperty('type'))
		{
			if(obj.type.startsWith('image'))
			{
				const classAttr = (obj.className) ? `class="${obj.className}"` : '';
				let width = obj.width;
				let height = obj.height;
				let alt = obj.title;
				let imageUrl = encodeURI(decodeURI((`/images/${obj.fileName}`)));
				let lazyLoading = '';
				
				if(obj.maxHeight)
				{
					const maxHeight = obj.maxHeight;
					height = (obj.height > maxHeight) ? maxHeight : obj.height;
					width = (obj.height > maxHeight) ? parseInt(obj.width / (obj.height / maxHeight)) : obj.width;
				}
				
				if(obj.lazyLoading)
				{
					lazyLoading = 'loading="lazy"';
				}
				
				if(obj.alt)
				{
					alt = obj.alt;
				}
				
				let params = new URLSearchParams;

				if(width > 730)
				{
					params.set('width', 730);
				}
				if(width > 1110)
				{
					params.set('width', 1110);
				}
				
				let srcAttr = `src="${imageUrl}?${params.toString()}"`;
				
				const srcSetRanges = [320, 640, 960, 1280, 2560].filter(i => i <= width);
				const srcSetItems = (srcSetRanges.length > 0) ? srcSetRanges.map(row => {
					params.set('width', row);
					return `${imageUrl}?${params.toString()} ${row}w`
				}).join(',') : false;
				const srcSetAttr = (srcSetItems) ? `srcset="${srcSetItems}"` : '';
				
				return `<img ${classAttr} alt="${alt}" width="${width}" height="${height}" ${srcAttr} ${srcSetAttr} ${lazyLoading} />`;
			}
		}
	}
};

export const isoNumber = ({number}) => {
	let isoNumber = number.match(/\d+/g);
	isoNumber = (Array.isArray(isoNumber)) ? isoNumber.join('') : '';
	return isoNumber;
};

export const sortByOrderKey = (a, b) => {
	
	if (a.order > b.order) {
		return 1;
	}
	
	if (a.order < b.order) {
		return -1;
	}
	
	return 0;		
};

export const slugRegex = (value) => {
	const regex = /^[\w]+(?:-[\w]+)*$/igm;		
	return (value) ? regex.test(value) : true;
};

export const imageFileRegex = str => {
	
	let valid = false;
	const extensions = ['apng', 'gif', 'jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'webp', 'svg']
	
	extensions.forEach(row => {
		if(str.endsWith(row))
		{
			valid = true;
		}
	});
	
	return valid;
};

export const isUrl = str => {
	const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/igm;

	return (str) ? regex.test(str) : false;
}

export const findPageBySlug = ({slug, pages}) => {
	let output = false;
	
	if(slug && Array.isArray(pages))
	{
		const thisPage = pages.find(i => i.slug === slug);
		
		if(typeof thisPage !== 'undefined')
		{
			output = thisPage;
		}
	}
	
	return output;
};

export const listLangItems = ({website, request}) => {

	const {defaultLanguage, currentLanguage, pages} = website;	
	const {slug} = request;
	const page = findPageBySlug({slug, pages});
	
	let output = [];
	
	for(const k in langLabels)
	{		
		const thisName = langLabels[k].name;
		
		let thisUrl = (k !== defaultLanguage) ? k : '';
	
		if(slug)
		{
			let pageSlug = '';
			
			if(page.hasOwnProperty('slugs'))
			{
				if(typeof page.slugs[k] !== 'undefined')
				{
					pageSlug = page.slugs[k];
				}
			}
			
			thisUrl = (thisUrl && pageSlug) ? `${thisUrl}/${pageSlug}` : pageSlug;			
		}
		
		let items = {
			lang: k,
			href: `/${thisUrl}`,
			text: `${thisName}`,
			iscurrentLanguage: (currentLanguage === k) ? true : false
		};
		
		output.push(items);
	}
	return output;
};


export const secureHeaders = {
	'Content-Security-Policy' : 'upgrade-insecure-requests',
	'Strict-Transport-Security' : 'max-age=2592000',
	'X-Xss-Protection' : '1; mode=block',
	'X-Frame-Options' : 'DENY',
	'X-Content-Type-Options' : 'nosniff',
	'Referrer-Policy' : 'strict-origin-when-cross-origin',
};

export const isNumber = val => /^\d+$/.test(val);
export const isEmail = val => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(val);
export const recaptcha = () => true;

	
export const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}	
	
export const pathNameToArr = pathName => {
	let output = {
		full: [],
		first: '',
		last: ''
	};
	let arr = pathName.split('/') || [];
	arr = arr.filter(i => i) || [];
	
	arr.forEach((v, i) => {
		
		output.full.push(v);
		
		if(i === 0)
		{
			output.first = v;
		}
		if((i+1) === (arr.length - 1))
		{
			output.beforeLast = v;
		}
		if((i+1) === arr.length)
		{
			output.last = v;
		}
	});
	
	return output;
};

export const contentTypeIsHtml = ({headers}) => {
	let output = false;
	
	if(headers)
	{
		if(headers.hasOwnProperty('content-type'))
		{
			if(headers['content-type'].includes('text/html'))
			{
				output = true;
			}
		}				
	}
	return output;
};

export const getFallBackLang = obj =>  {
	let output = null;
	
	if(typeof obj === 'object')
	{
		for(let k in obj)
		{
			if(obj.hasOwnProperty(k))
			{
				output = obj[k];
				break;
			}
		}
	}

	return output;
};

export const validUrlCharacters = (str) => /^([\w_\-\/#$&()=?¿@,;.:]|%[\w]{2}){0,2000}$/g.test(str);


const getSlug = ({pathNameArr, hasPagination}) => {
	
	return pathNameArr.full
	.filter(i => !langList.includes(i))
	.filter(i => {
		let output = true;
		if(hasPagination)
		{
			if(pathNameArr.beforeLast === i || pathNameArr.last === i)
			{
				output = false;
			}
		}
		return output;
	})
	.join('/');
};

export const paginateEntries = ({items, pageNumber, itemsPerPage}) => {
	
	const offset = (pageNumber - 1) * itemsPerPage;
	const paginatedItems = items.slice(offset).slice(0, itemsPerPage);
	const totalPages = Math.ceil(items.length / itemsPerPage);

	return {
		pageNumber,
		itemsPerPage,
		pre_page: pageNumber - 1 ? pageNumber - 1 : null,
		next_page: (totalPages > pageNumber) ? pageNumber + 1 : null,
		total: items.length,
		totalPages,
		data: paginatedItems
	};
};

export const parseRequest = (event) => {
	
	const {request, waitUntil} = event;
	let requestUrl = encodeURI(decodeURI(request.url));
	const url = new URL(requestUrl);
	const {pathname: pathName, searchParams, hostname: hostName} = url;	
	const pathNameArr = pathNameToArr(pathName);
	const altLang = langList.find(i => i === pathNameArr.first) || false;
	const hasPagination = (pathNameArr.beforeLast === 'p' && isNumber(pathNameArr.last)) ? true : false;
	const pageNumber = hasPagination ? parseInt(pathNameArr.last) : 1;
	const slug = getSlug({pathNameArr, hasPagination});
	const homeUrl = (langList.includes(pathNameArr.first)) ? `/${pathNameArr.first}/` : '/';

	return {
		waitUntil,
		...request,
		homeUrl,
		url: requestUrl,
		hostName,
		pathName,
		searchParams,
		pathNameArr,
		slug,
		altLang,
		pageNumber
	};	
};

export const doSoftRedirect = ({hostName, url, status}) => ((status === 301 || status === 302) && (hostName !== CONTENTFUL_DOMAIN || !url.startsWith('https'))) ? true : false;

export const softRedirectBody = (url) => `<!doctype html><html><head><meta http-equiv="refresh" content="2;url=${url}" /><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"></head><body><a href="${url}">${url}</a></body></html>`; 