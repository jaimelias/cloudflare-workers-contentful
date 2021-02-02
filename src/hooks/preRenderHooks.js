export const enqueueHook = ({store, slug, type, is404, reCaptchaSiteKey, accommodationTypes, currentLanguage, labels}) => {
	
	const {dispatch} = store;
	
	dispatch({type: ActionTypes.ENQUEUE_SCRIPT, scripts: bootstrapScripts});
	
	if(slug === '')
	{

	}
	else
	{
		if(is404)
		{
			
		}
		else
		{
			dispatch({type: ActionTypes.ENQUEUE_SCRIPT, scripts: formScripts(reCaptchaSiteKey)});
			
			if(accommodationTypes.includes(type))
			{
				dispatch({type: ActionTypes.ENQUEUE_SCRIPT, scripts: pickadateScripts({
					currentLanguage,
					labels
				})});
			}
		}
	}
};

const bootstrapScripts = {
	bootstrapScriptsCss: {
		concat: true,
		file: 'bootstrap.5.0.0.min.css',
		order: 100,
		inline: [{
			location: 'after',
			content: `
html, body {
	height: 100vh;
}
.container
{
	max-width: 1200px;
}
form a.btn
{
	color: #fff;
}
h1, h2, h3, h4, h5, h6, .serif{
	font-family: serif;
}
#footer a:not(.btn) {
	color: #444
}
.entry-content img {
	max-width: 100%;
	height: auto;
}
.hidden {
	display: none;
}
.chat-component
{
	z-index: 9999;
}
			`
		}]
	},
	bootstrapScriptsJs: {
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
		location: 'footer',
		async: true,
		defer: true,
		file: `https://www.google.com/recaptcha/api.js?render=${reCaptchaSiteKey}`,
		order: 20
	},	
	formValidator: {
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
			location: 'footer',
			file: 'pickadate.5.0.0.min.js',
			inline: [{
				location: 'after',
				content: `			
				const initialState = {
				  templateHookWords: ${templateHookWords},
				  firstDayOfWeek: 1,
				  minimum: new Date()
				};			
				
				['startDate', 'endDate'].forEach(i => {
					
					const input = document.getElementById(i);
					const picker = pickadate.create(initialState);
					pickadate.render(input, picker);					
					
					input.addEventListener('pickadate:change', value => {
						input.value = picker.getValue('YYYY-MM-DD');
						input.blur();
						document.getElementById('request-form').click();
					});				
					
				});
							
				`
			}],
			order: 40
		}	
	}
	
};