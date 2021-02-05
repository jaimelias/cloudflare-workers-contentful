import * as sharedData from './utilities/sharedData'
import {FacebookPixel} from './components/facebookPixelComponent'
import {GoogleAnalytics} from './components/googleAnalyticsComponent';
import {TopMenu, TopMenuContact} from './components/topMenuComponent';
import {JsonLd} from './components/jsonLdComponent';
import {Content} from './components/contentComponent';
import {Footer} from './components/footerComponent';
import {getMenuItems} from './menuItems';
import {enqueueScripts} from './enqueue';
import {enqueueHook} from './hooks/preRenderHooks';

export const htmlTemplate = ({slug, is404, store}) => {
	
	const {langLabels} = LangConfig;
	const {getState} = store;
	const {accommodationTypes} = sharedData;
	const pages = getState().contentful.data.pages;
	const {hostName, pathName} = getState().request.data;
	
	const {
		siteName,
		title,
		siteUrl,
		domainName,
		description,
		content,
		countryCode,
		currentLanguage,
		streetAddress,
		country,
		stateProvince,
		location,
		googleMapsUrl,
		coordinates,
		googleAnalytics, 
		facebookPixel,
		telephoneNumber,
		whatsappNumber,
		facebookMessengerUsername,
		instagramUsername,
		priceRange,
		image,
		logoType,
		favicon,
		actionButtonUrl,
		actionButtonText,
		type,
		defaultLanguage,
		reCaptchaSiteKey
	} = getState().contentful.data.websites[0];
	
	const labels = langLabels[currentLanguage].labels;

	const {
		notFoundTitle,
		labelCallUs
	} = labels;
	
	const {
		getTitle, 
		getDescription, 
		Favicon, 
		getHomeUrl, 
		findPageBySlug,
		listLangItems,
		pageHasForm
	} = Utilities;
	
	const page = findPageBySlug({slug, pages});
		
	const homeUrl = getHomeUrl({
		currentLanguage,
		defaultLanguage
	});
		
	const RenderFacebookPixel = (hostName === domainName) ? FacebookPixel({pixel: facebookPixel}) : '';
	
	const pageTitle = (is404) ? notFoundTitle : getTitle({
		slug,
		title,
		pages
	});
	
	const titleTag = (slug) ? `${pageTitle} | ${siteName}` : `${siteName} | ${pageTitle}`;
	const RenderTitleTag = `<title>${titleTag}</title>`;
	
	const pageDescription = getDescription({
		slug,
		description,
		pages
	});

	const langItems = listLangItems({
		defaultLanguage,
		currentLanguage,
		page,
		slug,
		siteUrl
	});
		
	const menuItems = getMenuItems({
		pages,
		langItems,
		currentLanguage,
		defaultLanguage
	});
	
	const thisPageHasForm = pageHasForm({
		actionButtonText,
		actionButtonUrl,
		hostName,
		pathName
	});
		
	const RenderHooks = enqueueHook({
		type,
		slug,
		store,
		is404,
		reCaptchaSiteKey,
		accommodationTypes,
		currentLanguage,
		labels
	});
	
	const RenderContent = Content({
		store,
		slug,
		title: pageTitle,
		description: pageDescription,
		content,
		labels,
		is404,
		pages,
		thisPageHasForm,
		sharedData,
		currentLanguage
	});
	
	const RenderFooter = Footer({
		siteName,
		whatsappNumber,
		telephoneNumber,
		instagramUsername,
		facebookMessengerUsername,
		location,
		country,
		googleMapsUrl
	});
	
	const RenderLangLinks = langItems.map(row => {
		return `<link rel="alternate" hreflang="${row.lang}" href="${row.href}" />`;
	}).join('');
	
	const langFallbackUrl = (langItems.length > 0) ? langItems.find(i => i.lang === defaultLanguage) : false;
	
	const RenderLangFallbackUrl = (langFallbackUrl.hasOwnProperty('href')) ? `<link rel="alternate" hreflang="x-default" href="${langFallbackUrl.href}" />` : '';
	
	const canonicalUrl = (langItems.length > 0) ? langItems.find(i => i.lang === currentLanguage) : false;
	const RenderCanonical = (canonicalUrl.hasOwnProperty('href')) ? `<link rel="canonical" href="${canonicalUrl.href}" />` : '';
			
	const RenderJsonLd = JsonLd({
		siteName, 
		countryCode, 
		location, 
		stateProvince, 
		streetAddress, 
		telephoneNumber, 
		image, 
		priceRange, 
		slug, 
		type,
		title: pageTitle,
		coordinates
	});
	
	const RenderGoogleAnalytics = (hostName === domainName) ? GoogleAnalytics({gTagId: googleAnalytics}) : '';
		
	const RenderTopMenu = TopMenu({
		siteName,
		hostName,
		logoType,
		menuItems,
		homeUrl,
		actionButtonText,
		actionButtonUrl
	});
	
	const RenderTopMenuContact = TopMenuContact({
		telephoneNumber,
		labelCallUs
	});
	
	const RenderFavicon = Favicon({
		favicon
	});
		
	const RenderDescriptionTags = (pageDescription) ? `<meta name="description" content="${pageDescription}"/><meta property="og:description" content="${pageDescription}"/>` : '';
	
	const scripts = getState().enqueue.scripts;
		
	const scriptArgs = {
		scripts, 
		location: 'footer', 
		type: 'js'
	};
	const FooterScripts = enqueueScripts(scriptArgs);
	const HeaderScripts = enqueueScripts({...scriptArgs, location: 'header'});
	const HeaderStyles = enqueueScripts({...scriptArgs, type: 'css'});
	
	return	`<!doctype html>
		<html lang="${currentLanguage}">
			<head>
				${RenderTitleTag}
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
				${RenderCanonical}
				${RenderLangLinks}
				${RenderLangFallbackUrl}
				${HeaderStyles}
				${RenderFavicon}
				<meta property="og:type" content="website"/>
				<meta property="og:title" content="${siteName} | ${pageTitle}"/>
				${RenderDescriptionTags}
				${HeaderScripts}
				${RenderGoogleAnalytics}
				${RenderJsonLd}
			</head>
			<body>
				${RenderFacebookPixel}
				${RenderTopMenuContact}
				${RenderTopMenu}
				${RenderContent}
				${RenderFooter}
				${FooterScripts}
			</body>
		</html>
	`
};