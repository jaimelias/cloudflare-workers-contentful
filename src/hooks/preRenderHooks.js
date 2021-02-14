export const enqueueHook = ({store, accommodationTypes, labels, thisPageHasForm}) => {
	
	const {dispatch, getState} = store;
	const website = getState().contentful.data.websites.entries[0];
	const {type, currentLanguage, crm, facebookPixel, googleAnalytics} = website;
	
	dispatch({type: ActionTypes.ENQUEUE_SCRIPT, payload:{scripts: bootstrapScripts}});
	dispatch({type: ActionTypes.ENQUEUE_SCRIPT, payload:{scripts: trackingScripts({facebookPixel, googleAnalytics})}});
	
	if(thisPageHasForm)
	{
		if(typeof crm === 'object')
		{
			if(crm.hasOwnProperty('reCaptchaSiteKey'))
			{
				dispatch({type: ActionTypes.ENQUEUE_SCRIPT, payload: {scripts: formScripts(crm.reCaptchaSiteKey)}});
			}
		}
		
		if(accommodationTypes.includes(type))
		{
			dispatch({type: ActionTypes.ENQUEUE_SCRIPT, payload: {scripts: pickadateScripts({currentLanguage, labels})}});
		}
	}
};

const bootstrapScripts = {
	bootstrapScriptsCss: {
		type: 'css',
		concat: true,
		file: 'bootstrap.5.0.0.min.css',
		order: 100,
		inline: [{
			location: 'after',
			content: `body,html{height:100vh}.container{max-width:1200px}form a.btn{color:#fff}.serif,h1,h2,h3,h4,h5,h6{font-family:serif}#footer a:not(.btn){color:#444}.entry-content img{max-width:100%;height:auto}.hidden{display:none}.chat-component{z-index:9999}`
		}]
	},
	bootstrapScriptsJs: {
		type: 'js',
		location: 'footer',
		async: true,
		defer: true,
		concat: true,
		file: 'bootstrap.5.0.0.bundle.min.js',
		order: 10
	}
};

const formScripts = (reCaptchaSiteKey) => ({
	recaptcha: {
		type: 'js',
		location: 'footer',
		async: true,
		defer: true,
		file: `https://www.google.com/recaptcha/api.js?render=${reCaptchaSiteKey}`,
		order: 20
	},	
	formValidator: {
		type: 'js',
		location: 'footer',
		async: true,
		defer: true,
		file: 'formValidator.js',
		inline: [{
			location: 'before',
			content: `const reCaptchaSiteKey = '${reCaptchaSiteKey}';`
		}],
		order: 10
	}
});

const pickadateScripts = ({currentLanguage, labels}) => {
	
	const templateHookWords = (currentLanguage !== 'en') ? JSON.stringify(labels.templateHookWords) : '{}';	
	
	return {
		pickadate: {
			type: 'js',
			location: 'footer',
			file: 'pickadate.5.0.0.min.js',
			inline: [{
				location: 'after',
				content: `const initialState={templateHookWords:${templateHookWords},firstDayOfWeek:1,minimum:new Date};["startDate","endDate"].forEach(e=>{const t=document.getElementById(e),a=pickadate.create(initialState);pickadate.render(t,a),t.addEventListener("pickadate:change",e=>{t.value=a.getValue("YYYY-MM-DD"),t.blur(),document.getElementById("request-form").click()})});`
			}],
			order: 40
		}	
	}
};

const trackingScripts = ({googleAnalytics, facebookPixel}) => {
	
	let output = {};
	
	
	if(googleAnalytics)
	{
		output.googleAnalytics = {
			type: 'js',
			location: 'header',
			async: true,
			file: `https://www.googletagmanager.com/gtag/js?id=${googleAnalytics}`,
			inline: [{
				location: 'after',
				content: `function gtag(){dataLayer.push(arguments)}window.dataLayer=window.dataLayer||[],gtag("js",new Date),gtag("config","${googleAnalytics}");`
			}],
			order: 50
		};
		
		if(facebookPixel)
		{
			const pixel = {
				location: 'after',
				content: `!function(e,t,n,o,c,a,f){e.fbq||(c=e.fbq=function(){c.callMethod?c.callMethod.apply(c,arguments):c.queue.push(arguments)},e._fbq||(e._fbq=c),c.push=c,c.loaded=!0,c.version="2.0",c.queue=[],(a=t.createElement(n)).async=!0,a.src="https://connect.facebook.net/en_US/fbevents.js",(f=t.getElementsByTagName(n)[0]).parentNode.insertBefore(a,f))}(window,document,"script"),fbq("init","${facebookPixel}"),fbq("track","PageView");`
			};
			
			output.googleAnalytics.inline.push(pixel);
		}
	}	
	
	return output;
};