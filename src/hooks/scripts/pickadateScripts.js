export const pickadateScripts = ({currentLanguage, labels}) => {
	
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