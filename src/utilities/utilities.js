const {langLabels, langList} = LangConfig;
const {validEntryTypes} = SharedData;

export const formatToReadableDate = ({date, lang}) => {
	//returns MonthName DD, YYYY
	const d = new Date(date);
	const months = langLabels[lang].labels.months;
	return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

export const pageHasForm = ({website, slug, entryType}) => {
	
	const {contactPage} = website;
			
	if(entryType === 'packages')
	{
		return true;
	}
	else if(entryType === 'pages')
	{
		if(typeof contactPage === 'object')
		{
			if(contactPage.hasOwnProperty('slug'))
			{
				if(slug === contactPage.slug)
				{
					return true;
				}					
			}
		}
	}

	return false;
};

export const Favicon = (favicon) => {
		
	const faviconObj = (favicon) ? {
		type: favicon.type, 
		href: `/images/${favicon.fileName}`
	} : {
		type: 'image/svg+xml', 
		href: '/static/favicon.svg'
	};
	
	return `<link rel="icon" type="${faviconObj.type}" href="${faviconObj.href}" sizes="any">`;
};


export const escUrl = str => {
	return encodeURI(decodeURI(str).replace(/[&]/g, i => '&amp;'));	
};

export const Media = obj => {
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
				let imageUrl = encodeURI(decodeURI((`/images${obj.fileName}`)));
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

				params.set('width', width);

				if(width > 1200)
				{
					params.set('width', 1200);
				}
				if(width > 1400)
				{
					params.set('width', 1400);
				}
				
				let srcAttr = `src="${imageUrl}?${params.toString()}"`;
				
				const srcSetRanges = [576, 768, 992, 1200, 1400].filter(i => i <= width);
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

export const isoNumber = number => {
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

export const slugRegex = value => {
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

export const findBySlug = ({data, slug, entryType}) => {
	let output = {
		entryType: 'notFound',
		entry: undefined
	};
	
	let findData = undefined;
				
	if(slug)
	{
		if(entryType)
		{
			if(data.hasOwnProperty(entryType))
			{
				if(data[entryType].hasOwnProperty('entries'))
				{
					findData = data[entryType].entries.find(i => i.slug === slug);
					 
					if(typeof findData === 'object')
					{
						output = {
							entryType,
							entry: findData
						};				
					}				
				}				
			}
		}
		else
		{
			for(let k in data)
			{
				if(k !== 'websites')
				{				
					if(typeof data[k] === 'object')
					{
						if(data.hasOwnProperty(k))
						{
							if(data[k].hasOwnProperty('entries'))
							{
								findData = data[k].entries.find(i => i.slug === slug);
								
								if(typeof findData === 'object')
								{
									output = {
										entryType: k,
										entry: findData
									};
								}							
							}							
						}
					}
				}	
			}			
		}
	}
	else
	{
		output = {
			entryType: 'pages',
			entry: data.websites.entries[0].homepage
		};
	}
	
	return output;
};

export const listLangItems = ({store, entryType}) => {

	let output = [];
	const {getState} = store;
	const {data} = getState().contentful;
	const {websites} = data;
	const {slug} = getState().request.data;
	const website = websites.entries[0];
	const {defaultLanguage, currentLanguage} = website;
	const {entry} = findBySlug({data, slug, entryType});

	for(const k in langLabels)
	{		
		const thisName = langLabels[k].name;
		
		let thisUrl = (k !== defaultLanguage) ? k : '';
	
		if(slug)
		{
			let pageSlug = '';
			
			if(typeof entry === 'object')
			{
				if(entry.hasOwnProperty('slugs'))
				{
					if(typeof entry.slugs[k] !== 'undefined')
					{
						pageSlug = entry.slugs[k];
					}
				}
				
				thisUrl = (thisUrl && pageSlug) ? `${thisUrl}/${pageSlug}` : pageSlug;				
			}
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

export const capitalize = str => {
  if (typeof str !== 'string') return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
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

export const contentTypeIsHtml = headers => {
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

export const validUrlCharacters = str => /^([\w_\-\/#$&()=?¿@,;.:]|%[\w]{2}){0,2000}$/g.test(str);

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

const getApiBody = async ({pathNameArr, request}) => {
	
	const {headers} = request;
	
	if(pathNameArr.first === 'api')
	{
		const contentType = headers.get('Content-Type') || '';
				
		if(contentType.includes('application/json'))
		{
			return await request.json();
		}
	}	
	
	return false;
};

const getAltLang = ({pathNameArr, apiBody}) => {
	
	let output = langList.find(i => i === pathNameArr.first) || false;
	
	if(output === false && typeof apiBody === 'object')
	{
		if(apiBody.hasOwnProperty('language'))
		{
			output = apiBody.language;
		}
	}
	
	return output;
};

export const parseRequest = async (event) => {
	
	const {request, request: {url: requestUrl, headers}} = event;
	const url = new URL(encodeURI(decodeURI(requestUrl)));
	const {pathname: pathName, searchParams, hostname: hostName} = url;	
	const pathNameArr = pathNameToArr(pathName);
	let apiBody = await getApiBody({pathNameArr, request: request.clone()});
	let altLang = getAltLang({pathNameArr, apiBody});
	const ip = headers.get('CF-Connecting-IP') || '';
	const country = headers.get('cf-ipcountry') || '';
	const hasPagination = (pathNameArr.beforeLast === 'p' && isNumber(pathNameArr.last)) ? true : false;
	const pageNumber = hasPagination ? parseInt(pathNameArr.last) : 1;
	const slug = getSlug({pathNameArr, hasPagination});
	const homeUrl = (langList.includes(pathNameArr.first)) ? `/${pathNameArr.first}/` : '/';

	return {
		event,
		...request,
		apiBody,
		homeUrl,
		url: requestUrl,
		hostName,
		pathName,
		searchParams,
		pathNameArr,
		slug,
		altLang,
		pageNumber,
		ip,
		country
	};	
};

export const doSoftRedirect = ({hostName, url, status}) => ((status === 301 || status === 302) && (hostName !== CONTENTFUL_DOMAIN || !url.startsWith('https'))) ? true : false;

export const softRedirectBody = (url) => `<!doctype html><html><head><meta http-equiv="refresh" content="2;url=${url}" /><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"></head><body><a href="${url}">${url}</a></body></html>`; 


export const getAllPageTypes = data => {
	let output = [];
	
	for(let k in data)
	{
		if(k !== 'websites')
		{
			if(typeof data[k] === 'object')
			{
				output = [...output, ...data[k].entries];
			}			
		}
	}
	
	return output;
};

export const pageIsBlog = ({slug, website}) => {
	
	if(typeof website.blogPage === 'object')
	{
		if(slug === website.blogPage.slug)
		{
			return true;
		}
	}			
};

export const objToCssRules = obj => {
	
	let cssRules = '';
	
	for(let k in obj)
	{
		if(k !== 'name')
		{	
			const value = (typeof obj[k] === 'string') ? obj[k] : '';
			
			if(value)
			{
				let selector = `.${k}`;
				let rules = (value.startsWith('#')) ? value : `#${value}`;
				let hex = (value.startsWith('#')) ? value.substring(1) : value;
				let rgb = hexToRgb(hex);
							
				if(k.includes('Button'))
				{
					if(rgb && k.endsWith('BackgroundColor'))
					{
						let rgbaString = rgb.join(' ') + ' / ' + '50%';
						cssRules += `.btn${selector}:focus{box-shadow: 0 0 0 0.25rem rgb(${rgbaString});}`;
					}
					
					selector += `.btn, .${k}.btn:hover`;
				}			
				
				if(k.endsWith('BackgroundColor'))
				{				
					cssRules += `${selector}{background-color: ${rules}}`;
				}
				else if(k.endsWith('TextColor'))
				{
					cssRules += `${selector}{color: ${rules}}`;
				}				
			}
		}
	}
	
	return cssRules;
};

export const hexToRgb = hex => {
	
	let arr = hex.match(/.{1,2}/g);
	
	if(Array.isArray(arr))
	{
		if(arr.length === 3)
		{
			return [
				parseInt(arr[0], 16),
				parseInt(arr[1], 16),
				parseInt(arr[2], 16)
			];			
		}
	}
	
	return '';
};

export const isEntryType = str => (str) ? validEntryTypes.includes(str) : false;

export const getBypassCacheIps = (typeof BYPASS_CACHE_IPS === 'string') ? (BYPASS_CACHE_IPS.length > 0) ? BYPASS_CACHE_IPS.split(',').map(i => i.trim()) : [] : [];


export const isValidDateStr = str => {
	//returns YYYY-MM-DD
	const regEx = /^\d{4}-\d{2}-\d{2}$/;
	if(!str.match(regEx)) return false;  
	let d = new Date(str);
	const dNum = d.getTime();
	if(!dNum && dNum !== 0) return false;
	return d.toISOString().slice(0,10) === str;
};

export const formatDateStr = date => {
    let d = new Date(date);
	const year = d.getFullYear();
	let month = (d.getMonth() + 1).toString();
	let day = d.getDate().toString();
	
	month = (month.length < 2) ? '0' + month : month;
	day = (day.length < 2) ? '0' + day : day;

    return [year, month, day].join('-');
};

export const differenceBetweenDates = ({startDate, endDate}) => Math.ceil(Math.abs(startDate - endDate) / (1000 * 60 * 60 * 24));

export const isContentTypeInStore = data => {
	return (typeof data === 'object')
		? (data.hasOwnProperty('entries'))
		? (Array.isArray(data.entries))
		? (data.entries.length > 0)
		? (typeof data.entries[0] === 'object')
		? true
		: false
		:false
		:false
		:false
		:false;
};