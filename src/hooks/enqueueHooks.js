import {bootstrapScripts} from './scripts/bootstrapScripts';
import {formScripts} from './scripts/formScripts';
import {pickadateScripts} from './scripts/pickadateScripts';
import {trackingScripts} from './scripts/trackingScripts';
const {accommodationTypes} = SharedData;
const {pageHasForm} = Utilities;

export default class EnqueueHooks
{
	constructor({store, labels}){
		this.store = store;
		this.labels = labels;
		this.init();
	}
	init()
	{
		const {labels, store} = this;
		const {getState} = store;
		const website = getState().contentful.data.websites.entries[0];
		const request = getState().request.data;
		const {type, currentLanguage, crm, facebookPixel, googleAnalytics, theme} = website;
		const hasForm = pageHasForm({website, request});
		this.enqueue({scripts: bootstrapScripts(theme)});
		this.enqueue({scripts: trackingScripts({facebookPixel, googleAnalytics})});
		

		if(hasForm)
		{
			if(typeof crm === 'object')
			{
				if(crm.hasOwnProperty('reCaptchaSiteKey'))
				{
					this.enqueue({scripts: formScripts(crm.reCaptchaSiteKey)});
				}
			}
			
			if(accommodationTypes.includes(type))
			{
				this.enqueue({scripts: pickadateScripts({currentLanguage, labels})});
			}
		}
	}
	enqueue(payload)
	{
		this.store.dispatch({type: ActionTypes.ENQUEUE_SCRIPT, payload});
	}
}

