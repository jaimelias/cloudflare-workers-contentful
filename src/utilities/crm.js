export const sendGridSend = async ({payload, crm, website}) => {

	let output = {
		status: 500
	};
	
	const {whatsappNumber, siteName} = website;
	const {email, cc, subject, message, name} = crm;
	const htmlMessage = (typeof message === 'string') ? marked(message) : '';
		
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
