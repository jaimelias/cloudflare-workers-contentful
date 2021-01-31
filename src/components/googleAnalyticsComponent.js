export const GoogleAnalytics = ({gTagId}) => {
	
	let output = '';
	
	if(gTagId)
	{
		output = `
			<!-- Global site tag (gtag.js) - Google Analytics -->
			<script async src="https://www.googletagmanager.com/gtag/js?id=${gTagId}"></script>
			<script>
			  window.dataLayer = window.dataLayer || [];
			  function gtag(){dataLayer.push(arguments);}
			  gtag('js', new Date());
			  gtag('config', '${gTagId}');
			</script>	
		`;
	}

	return output;
};