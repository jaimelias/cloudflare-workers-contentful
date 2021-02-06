export const sendGridSend = async ({payload, crm, website}) => {

	let output = {
		status: 500
	};
	
	const {whatsappNumber, siteName} = website;
	const {email, cc, subject, message, name} = crm;
	const htmlMessage = (typeof message === 'string') ? marked(message) : '';
		
	const template = emailTemplate({
		payload,
		htmlMessage,
		isoWhatsapp: Utilities.isoNumber({number: whatsappNumber}),
		siteName
	});

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
			value: template
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
	.map(i => {
		let label = labels['label' + Utilities.capitalize(i)];
		return `<tr><td>${label}</td><td>${payload[i]}</td></tr>`;
	}).join('');
	
	const whatsappBtn = (isoWhatsapp) ? `<p style="font-size: 20px; text-align: center; font-weight: 900;"><a style="display: block; text-decoration: none; padding: 10px 15px; color: #ffffff; background-color: #25d366;" href="https://wa.me/${isoWhatsapp}?text=${urlEncodedsiteName}">Whatsapp</a></p>` : '';
	
	return `
		<div style="line-height: 1.5; max-width: 100%; width: 600px; margin: 0 auto; color: #000000;">
			<div style="padding: 20px; background-color: #ffffff; border: solid 1px #ddd;">

			<p>${labelHello} ${firstName},</p>

			${htmlMessage}

			<table style="table-layout: fixed; width: 100%;" cellspacing="0" cellpadding="5" border="1">
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
