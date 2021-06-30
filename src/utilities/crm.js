const {formFields} = SharedData;
const {findBySlug} = Utilities;

export const handleContactFormRequest = async ({store}) => {
	
	let output = {
		status: 500
	};
	
	let invalids = [];
	const {langList} = LangConfig;
	const {getState} = store;
	const {apiBody: payload} = getState().request.data;
	const {data} = getState().contentful;
	let entry = undefined;

	for(let key in formFields)
	{			
		if(!payload.hasOwnProperty(key))
		{
			if(formFields[key].hasOwnProperty('required'))
			{
				invalids.push(key);
			}				
		}
		else
		{
			if(formFields[key].hasOwnProperty('min'))
			{
				if(parseInt(payload[key]) < formFields[key].min)
				{
					invalids.push(key);
				}
			}
			if(formFields[key].hasOwnProperty('max'))
			{
				if(parseInt(payload[key]) > formFields[key].max)
				{
					invalids.push(key);
				}
			}
			if(formFields[key].hasOwnProperty('minLength'))
			{
				if(payload[key].length < formFields[key].minLength)
				{
					invalids.push(key);
				}
			}
			if(formFields[key].hasOwnProperty('maxLength'))
			{
				if(payload[key].length > formFields[key].maxLength)
				{
					invalids.push(key);
				}
			}			

			if(formFields[key].hasOwnProperty('validator'))
			{
				let validator = formFields[key].validator;
				
				if(Utilities.hasOwnProperty(validator))
				{
					validator = Utilities[validator];
					
					if(!validator(payload[key]))
					{
						invalids.push(key);
					}
				}					
			}
			
			if(key === 'language')
			{
				if(!langList.includes(payload[key]))
				{
					invalids.push(key);
				}
			}
			if(key === 'slug')
			{
				entry = findBySlug({data, slug: payload[key]}).entry;

				if(typeof entry === 'undefined')
				{
					invalids.push(key);
				}
			}
		}
	}
	
	if(invalids.length === 0)
	{
		
		const website = data.websites.entries[0];
		const crm = website.crm;
		
		if(crm)
		{					
			const outputPayload = Object.keys(payload)
			.filter(i => formFields[i])
			.reduce((obj, key) => {
				obj[key] = payload[key];
				return obj;						
			}, {});					
			
			output = await sendGridSend({
				payload: outputPayload,
				crm,
				website,
				entry
			});				
		}
	}
	else
	{
		output.status = 400;
		output.body = 'invalid fields: ' + invalids.join(',');
	}

	return output;
};


const sendGridSend = async ({payload, crm, website, entry}) => {

	let output = {
		status: 500
	};
	
	const {whatsappNumber, siteName} = website;
	const {email, cc, subject, message, name} = crm;
	const htmlMessage = (typeof message === 'string') ? marked(message) : '';

	delete payload.slug;
	payload.pageTitle = entry.title;
		
	let template = emailTemplate({
		payload,
		htmlMessage,
		isoWhatsapp: Utilities.isoNumber(whatsappNumber),
		siteName
	});
	
	template = new Response(template, {
		headers: {
			'Content-Type': 'text/html'
		}
	});
	
	template = emailHtmlRewriter().transform(template);
	
	const html = await template.text();

	const emailPayload = {
		personalizations: [{
			to: [{
				email: payload.email
			}],
			cc: [{
				email: cc
			}]
		}],
		from: {
			email: email,
			name: name
		},
		subject: `${payload.firstName} - ${subject}`,
		content: [{
			type: 'text/html',
			value: html
		}]
	};

	const sendgrid = await fetch('https://api.sendgrid.com/v3/mail/send', {
		method: 'post',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${crm.SendGridWebApiKey}`
		},
		body: JSON.stringify(emailPayload)
	});

	if(sendgrid.ok)
	{
		output.status = 200;
	}
	else
	{
		output.status = crm.status;
	}
	
	output.body = sendgrid.statusText;
	
	return output;
};

const emailTemplate = ({payload, htmlMessage, isoWhatsapp, siteName}) => {

	const labels = LangConfig.langLabels[payload.language].labels;
	const {firstName} = payload;
	const {labelHello, labelOriginalData} = labels;
	const urlEncodedsiteName = encodeURIComponent(siteName);
	
	const originalData = Object.keys(payload)
	.filter(i => i !== 'token' && i !== 'language')
	.map(v => {
		let label = labels['label' + Utilities.capitalize(v)];
		return `<tr><td>${label}</td><td>${payload[v]}</td></tr>`;
	}).join('');
	
	const whatsappBtn = (isoWhatsapp) ? `<p style="font-size: 20px; text-align: center; font-weight: 900;"><a style="display: block; text-decoration: none; padding: 10px 15px; color: #ffffff; background-color: #25d366;" href="https://wa.me/${isoWhatsapp}?text=${urlEncodedsiteName}">Whatsapp</a></p>` : '';
	
	return `
		<div style="line-height: 1.5; max-width: 100%; width: 600px; margin: 0 auto; color: #000000;">
			<div style="padding: 20px; background-color: #ffffff; border: solid 1px #ddd;">

			<p>${labelHello} ${firstName},</p>

			${htmlMessage}

			<table style="table-layout: fixed; width: 100%;" cellspacing="0" cellpadding="5" border="0" width="100%">
			<thead>
				<tr>
					<th colspan="2">${labelOriginalData}</th>
				</tr>
			</thead>
			<tbody>${originalData}</tbody>
			</table>

			${whatsappBtn}
			</div>
		</div>
	`;
};

export const emailHtmlRewriter = store => new HTMLRewriter()
.on('table', new emailTableRewriter())
.on('table > tbody > tr:nth-child(odd)', new emailTableTrRewriter())

class emailTableTrRewriter {
	element(element){
		element.setAttribute('style', 'background-color: #f7f7f7;');
	}
}

class emailTableRewriter {
	element(element)
	{
		element.setAttribute('style', 'table-layout: fixed; width: 100%;');
		element.setAttribute('cellspacing', '0');
		element.setAttribute('cellpadding', '5');
		element.setAttribute('border', '0');
		element.setAttribute('width', '100%');
	}
}
