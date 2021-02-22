import {bootstrapScripts} from './scripts/bootstrapScripts';
import {formScripts} from './scripts/formScripts';
import {pickadateScripts} from './scripts/pickadateScripts';
import {trackingScripts} from './scripts/trackingScripts';

export const enqueueHook = ({store, accommodationTypes, labels, hasForm}) => {
	
	const {dispatch, getState} = store;
	const website = getState().contentful.data.websites.entries[0];
	const {type, currentLanguage, crm, facebookPixel, googleAnalytics} = website;
	
	dispatch({type: ActionTypes.ENQUEUE_SCRIPT, payload:{scripts: bootstrapScripts}});
	dispatch({type: ActionTypes.ENQUEUE_SCRIPT, payload:{scripts: trackingScripts({facebookPixel, googleAnalytics})}});
	
	if(hasForm)
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