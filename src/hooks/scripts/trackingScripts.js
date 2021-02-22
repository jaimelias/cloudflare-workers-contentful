export const trackingScripts = ({googleAnalytics, facebookPixel}) => {
	
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