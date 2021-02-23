import {bootstrapScripts} from './scripts/bootstrapScripts';
import {formScripts} from './scripts/formScripts';
import {pickadateScripts} from './scripts/pickadateScripts';
import {trackingScripts} from './scripts/trackingScripts';

export default class EnqueueHooks
{
	constructor({store, accommodationTypes, labels, hasForm}){
		this.store = store;
		this.accommodationTypes = accommodationTypes;
		this.labels = labels;
		this.hasForm = hasForm;
		this.init();
	}
	init()
	{
		const {accommodationTypes, labels, hasForm, store} = this;
		const website = store.getState().contentful.data.websites.entries[0];
		const {type, currentLanguage, crm, facebookPixel, googleAnalytics} = website;
		
		this.enqueue({scripts: bootstrapScripts});
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