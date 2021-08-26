export const formScripts = reCaptchaSiteKey => ({
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