import * as sharedData from '../utilities/sharedData'
import {TopMenu, TopMenuContact} from './components/topMenuComponent';
import {Footer} from './components/footerComponent';
import {getMenuItems} from '../menuItems';
import {renderScripts} from '../enqueue';
import {enqueueHook} from './enqueueHooks';
import PageHooks from './pageHooks';

const {Favicon, listLangItems, pageHasForm} = Utilities;
const {langLabels} = LangConfig;

export const templateHooks = ({store}) => {

	const {getState, render} = store;
	const {accommodationTypes} = sharedData;
	const pages = getState().contentful.data.pages.entries;
	const {hostName, slug, homeUrl} = getState().request.data;
	const website = getState().contentful.data.websites.entries[0];
	const {
		siteName,
		currentLanguage,
		telephoneNumber,
		favicon,
		actionButtonUrl,
		actionButtonText,
		defaultLanguage
	} = website;
	
	const langItems = listLangItems({defaultLanguage, currentLanguage, pages, slug});
	const labels = langLabels[currentLanguage].labels;
	const hasForm = pageHasForm({actionButtonText, actionButtonUrl, hostName, slug});	
		
	new PageHooks({store, hasForm, sharedData, labels});
	enqueueHook({store, accommodationTypes, labels, hasForm});
	
	const {title, description, content, status} = getState().template;
	
	const renderTitle = (slug) ? `${title} | ${siteName}` : `${siteName} | ${title}`;
	
	render.addHooks({
		content: `<title>${renderTitle}</title>`,
		order: 1,
		location: 'head'
	});

	if(status === 200)
	{
		let canonicalUrl = langItems.find(i => i.lang === currentLanguage);
	
		if(canonicalUrl)
		{
			canonicalUrl = new URL(canonicalUrl.href, `https://${CONTENTFUL_DOMAIN}`);

			render.addHooks({
				content: `<link rel="canonical" href="${canonicalUrl}" >`,
				order: 10,
				location: 'head'
			});
		}
		
		if(langItems.length > 1)
		{
			render.addHooks({
				content: langItems.map(r => `<link rel="alternate" hreflang="${r.lang}" href="${r.href}" />`).join('\n\t\t'),
				order: 15,
				location: 'head'
			});

			const langFallbackUrl = langItems.find(i => i.lang === defaultLanguage);
			
			if(langFallbackUrl)
			{
				render.addHooks({
					content: `<link rel="alternate" hreflang="x-default" href="${langFallbackUrl.href}" />`,
					order: 15,
					location: 'head'
				});		
			}		
		}
	}

	render.addHooks({
		content: TopMenu({
			menuItems: getMenuItems({pages, langItems, currentLanguage, defaultLanguage}),
			hostName, 
			website,
			homeUrl
		}),
		order: 20,
		location: 'body'
	});	
		
	render.addHooks({
		content: TopMenuContact({telephoneNumber, labelCallUs: labels.labelCallUs}),
		order: 15,
		location: 'body'
	});	

	render.addHooks({
		content: `<div class="container-fluid my-5">${content}</div>`,
		order: 50,
		location: 'body'
	});

	render.addHooks({
		content: Favicon({favicon}),
		order: 10,
		location: 'head'
	});
	
	if(description)
	{
		render.addHooks({
			content:  `<meta name="description" content="${description}"/>`,
			order: 10,
			location: 'head'
		});	
	}

	
	//enqueue scripts
	const scripts = getState().enqueue.scripts;
	
	render.addHooks({
		content: renderScripts({scripts, type: 'css'}),
		order: 20,
		location: 'head'
	});
	
	render.addHooks({
		content: renderScripts({scripts, location: 'header', type: 'js'}),
		order: 80,
		location: 'head'
	});	
	
	render.addHooks({
		content: renderScripts({scripts, location: 'footer', type: 'js'}),
		order: 80,
		location: 'footer'
	});

	render.addHooks({
		content: Footer({website}),
		order: 50,
		location: 'footer'
	});
	
	return	`<!doctype html>
<html lang="${currentLanguage}">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
		${render.applyHooks('head')}
	</head>
	<body>
		${render.applyHooks('body')}
		${render.applyHooks('footer')}
	</body>
</html>`
};
