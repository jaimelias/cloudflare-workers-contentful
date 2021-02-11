import * as sharedData from './utilities/sharedData'
import {TopMenu, TopMenuContact} from './components/topMenuComponent';
import {JsonLd} from './components/jsonLdComponent';
import {Footer} from './components/footerComponent';
import {getMenuItems} from './menuItems';
import {enqueueScripts} from './enqueue';
import {enqueueHook} from './hooks/preRenderHooks';
import {templateHook} from './hooks/renderHooks';

const {Favicon, listLangItems, pageHasForm} = Utilities;
const {langLabels} = LangConfig;

export const templateHooks = ({store}) => {

	const {getState} = store;
	const {accommodationTypes} = sharedData;
	const pages = getState().contentful.data.pages;
	const {hostName, pathName, slug} = getState().request.data;
	const website = getState().contentful.data.websites[0];
	const {
		siteName,
		currentLanguage,
		telephoneNumber,
		favicon,
		actionButtonUrl,
		actionButtonText,
		defaultLanguage
	} = website;
	
	const labels = langLabels[currentLanguage].labels;
	const thisPageHasForm = pageHasForm({actionButtonText, actionButtonUrl, hostName, pathName});	
	
	templateHook({store, slug, labels, thisPageHasForm, sharedData});
	enqueueHook({slug, store, accommodationTypes, labels});
	
	const {title: pageTitle, description: pageDescription, content: RenderContent} = getState().template;
	
	const RenderTitleTag = `<title>${slug ? pageTitle + ' | ' + siteName : siteName + ' | ' + pageTitle}</title>`;
	
	const langItems = listLangItems({defaultLanguage, currentLanguage, pages, slug});
	
	const RenderFooter = Footer({website});
	
	const RenderLangLinks = langItems.map(r => `<link rel="alternate" hreflang="${r.lang}" href="${r.href}" />`).join('');
	
	const langFallbackUrl = (langItems.length > 0) ? langItems.find(i => i.lang === defaultLanguage) : false;
	
	const RenderLangFallbackUrl = (langFallbackUrl.hasOwnProperty('href')) ? `<link rel="alternate" hreflang="x-default" href="${langFallbackUrl.href}" />` : '';
	
	const canonicalUrl = (langItems.length > 0) ? langItems.find(i => i.lang === currentLanguage) : false;
	const RenderCanonical = (canonicalUrl.hasOwnProperty('href')) ? `<link rel="canonical" href="${canonicalUrl.href}" />` : '';
			
	const RenderJsonLd = JsonLd({website, slug, title: pageTitle});
	const RenderTopMenu = TopMenu({
		menuItems: getMenuItems({pages, langItems, currentLanguage, defaultLanguage}),
		hostName, 
		website
	});
	const RenderTopMenuContact = TopMenuContact({telephoneNumber, labelCallUs: labels.labelCallUs});
	const RenderFavicon = Favicon({favicon});
	const RenderDescriptionTags = (pageDescription) ? `<meta name="description" content="${pageDescription}"/><meta property="og:description" content="${pageDescription}"/>` : '';
	
	//enqueue scripts
	const scripts = getState().enqueue.scripts;
	const scriptArgs = {scripts, location: 'footer', type: 'js'};
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
		${RenderJsonLd}
	</head>
	<body>
		${RenderTopMenuContact}
		${RenderTopMenu}
		<div class="container-fluid my-5">
			${RenderContent}
		</div>
		${RenderFooter}
		${FooterScripts}
	</body>
</html>`
};