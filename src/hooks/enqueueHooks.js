import {bootstrapScripts} from './scripts/bootstrapScripts';
import {formScripts} from './scripts/formScripts';
import {pickadateScripts} from './scripts/pickadateScripts';
import {trackingScripts} from './scripts/trackingScripts';
const {accommodationTypes} = SharedData;
const {pageHasForm} = Utilities;

export default class EnqueueHooks
{
	constructor({store, labels, entryType}){
		this.store = store;
		this.labels = labels;
		this.entryType = entryType;
		this.init();
	}
	init()
	{
		const {labels, store, entryType} = this;
		const {getState} = store;
		const {data} = getState().contentful;
		const website = data.websites.entries[0];
		const {data: request, data: {slug}} = getState().request;
		const {type, currentLanguage, crm, facebookPixel, googleAnalytics, theme} = website;
		const hasForm = pageHasForm({website, slug, entryType});
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

