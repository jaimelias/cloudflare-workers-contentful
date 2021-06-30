const {objToCssRules} = Utilities;

export const bootstrapScripts = theme => {
	
	let output = {
		bootstrapScriptsCss: {
				type: 'css',
				concat: true,
				file: 'bootstrap.5.0.0.min.css',
				order: 100,
				inline: [{
					location: 'after',
					content: `body,html{height:100vh}.container{max-width:1200px}#footer a:not(.btn){color:#444}.entry-content img{max-width:100%;height:auto}.hidden{display:none}.chat-component{z-index:9999}hr{margin: 3rem 0}.entry-content p, .entry-content h1, .entry-content h2, .entry-content h3, .entry-content h4, .entry-content table, .entry-content iframe, .row:not(.form-row), .entry-content ul, .entry-content ol, .entry-content blockquote, .entry-content code{margin-bottom: 1.5rem!important} .entry-content ul > li, .entry-content ol > li{margin-bottom: 0.5rem!important}@media(max-width: 576px){.navbar-brand > img {max-width: 200px}}.grecaptcha-badge{visibility: hidden}`
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
	
	if(typeof theme === 'object')
	{
		const themeRules = objToCssRules(theme);
		
		if(themeRules)
		{
			output.bootstrapScriptsCss.inline.push({
				location: 'after',
				content: themeRules
			});
		}
	}	
	
	return output;
};

