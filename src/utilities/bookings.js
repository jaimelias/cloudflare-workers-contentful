const {isNumber, isValidDateStr, formatDateStr, differenceBetweenDates} = Utilities;
const variableDurationUnits = ['days', 'nights'];

const parseBookingArgs = ({bookings, request}) => {
		
	const {method, searchParams, apiBody: payload} = request;
	const {variablePricesEnabled, variablePricesLast, durationUnit, maxDuration} = bookings;
	let {duration} = bookings;
	let requestHasDateParams = false;
	let status = 200;
	let startDate = new Date();
	let endDate = new Date();
	let occupancyDuration = duration;
	startDate.setHours(0);
	endDate.setHours(0);

	const isVariableDurationUnit = (variablePricesEnabled)
		? variableDurationUnits.includes(durationUnit)
		: false;
	
	if(isVariableDurationUnit)
	{
		occupancyDuration = (variablePricesLast) ? duration : duration - 1;
		endDate.setDate(endDate.getDate() + occupancyDuration);
		
		if(method === 'GET')
		{
			if(searchParams.has('startDate') && searchParams.has('endDate'))
			{
				if(isValidDateStr(searchParams.get('startDate')) && isValidDateStr(searchParams.get('endDate')))
				{
					startDate = new Date(searchParams.get('startDate'));
					endDate = new Date(searchParams.get('endDate'));					
					
					if(startDate <= endDate)
					{
						requestHasDateParams = true;					
					}
					else
					{
						status = 400;
						statusText = 'illogical date param';					
					}
				}
			}
		}
		else if(method === 'POST')
		{
			if(typeof payload === 'object')
			{
				if(payload.hasOwnProperty('startDate') && payload.hasOwnProperty('endDate'))
				{
					if(isValidDateStr(payload.startDate) && isValidDateStr(payload.endDate))
					{
						startDate = new Date(payload.startDate);
						endDate = new Date(payload.endDate);						
						
						if(startDate <= endDate)
						{
							requestHasDateParams = true;
						}
						else
						{
							status = 400;
							statusText = 'illogical date param';				
						}
						
					}
					else
					{
						status = 400;
						statusText = 'invalid date param';
					}
				}
			}
		}
		
		if(requestHasDateParams)
		{	
			duration = differenceBetweenDates({startDate, endDate}) + 1;
			occupancyDuration = (variablePricesLast) ? duration : duration - 1;
			console.log({startDate, endDate, duration, occupancyDuration});
		}
		
		//startDate = formatDateStr(startDate);
		//endDate = formatDateStr(endDate);
	}
	
	if(duration > maxDuration)
	{
		status = 400;
		statusText: 'invalid duration param';
	}
	
	return (status === 200) 
	? {...bookings, startDate, endDate, isVariableDurationUnit, duration, status, requestHasDateParams}
	: {status, statusText};
};

export const getStartingAt = ({packagePage, request}) => {
	
	let output = 0;
	let {bookings, slug} = packagePage;
	
	if(typeof bookings === 'undefined')
	{
		return output;
	}

	const {startingAt} = bookings || 0;

	/*
		startingAt = 'Per Person' || 'Full Price' || 'Duration' || 'Do Not Show'
	*/

	const validateConfig = isValidBookingConfig(bookings);
	
	if(validateConfig.status === 200)
	{
		bookings = parseBookingArgs({bookings, request});

		///needs a select seasons find method here!!!!!!!!!!
		const prices = parseAllPrices(bookings) || {};
		
		console.log(prices);
	}

	return output;
};

const parseAllPrices = bookings => {
	
	//This function sums fixed + (variable * duration) of each price type of each season
	
	const {seasons, duration, variablePricesEnabled} = bookings;
	
	let output = {};
	
	for(let s in seasons)
	{
		const {fixedPrices, variablePrices, dates} = seasons[s];
		output[s] = {
			dates,
			fixedPrices: {},
			variablePrices: {},
			subtotal: {}
		};
		
		if(Array.isArray(fixedPrices))
		{
			fixedPrices.forEach((price, i) => {
				
				const paxNum = i + 1;
				
				for(let p in price)
				{
					const pricePerPerson = isNumber(price[p]) ? price[p] : 0;
					const fullPrice = pricePerPerson * paxNum;
					
					if(typeof output[s].fixedPrices[p] === 'undefined')
					{
						output[s].fixedPrices[p] = {
							pricesPerPerson: [],
							fullPrices: [],
							minPricePerPerson: pricePerPerson,
							minFullPrice: fullPrice,
							maxPricePerPerson: pricePerPerson,
							maxFullPrice: fullPrice	
						};
					}
					
					const {
						minPricePerPerson, 
						minFullPrice, 
						maxPricePerPerson, 
						maxFullPrice,
						pricesPerPerson,
						fullPrices
					} = output[s].fixedPrices[p];
					
					output[s].fixedPrices[p] = {
						...output[s].fixedPrices[p],
						pricesPerPerson: [...pricesPerPerson, pricePerPerson],
						fullPrices: [...fullPrices, fullPrice],
						minPricePerPerson: Math.min(minPricePerPerson, pricePerPerson),
						minFullPrice: Math.min(minFullPrice, fullPrice),
						maxPricePerPerson: Math.max(maxPricePerPerson, pricePerPerson),
						maxFullPrice: Math.max(maxFullPrice, fullPrice)
					}
				}
			});			
		}

		if(Array.isArray(variablePrices) && variablePricesEnabled)
		{
			variablePrices.forEach((price, i) => {
				
				const paxNum = i + 1;
				
				for(let p in price)
				{
					const pricePerPerson = isNumber(price[p]) ? price[p] * duration : 0;
					const fullPrice = pricePerPerson * paxNum;
					
					if(typeof output[s].variablePrices[p] === 'undefined')
					{
						output[s].variablePrices[p] = {
							pricesPerPerson: [],
							fullPrices: [],
							minPricePerPerson: pricePerPerson,
							minFullPrice: fullPrice,
							maxPricePerPerson: pricePerPerson,
							maxFullPrice: fullPrice								
						};
					}
					
					const {
						minPricePerPerson, 
						minFullPrice, 
						maxPricePerPerson, 
						maxFullPrice,
						pricesPerPerson,
						fullPrices
					} = output[s].variablePrices[p];
					
					output[s].variablePrices[p] = {
						...output[s].variablePrices[p],
						pricesPerPerson: [...pricesPerPerson, pricePerPerson],
						fullPrices: [...fullPrices, fullPrice],
						minPricePerPerson: Math.min(minPricePerPerson, pricePerPerson),
						minFullPrice: Math.min(minFullPrice, fullPrice),
						maxPricePerPerson: Math.max(maxPricePerPerson, pricePerPerson),
						maxFullPrice: Math.max(maxFullPrice, fullPrice)
					}
				}
			});
		}
	}
	
	return output;
};

const isValidBookingConfig = bookings => {
	
	let output = {
		status: 500,
		statusText: 'invalid package configuration'
	}
	
	if(typeof bookings === 'object')
	{
		const {enabled, maxParticipantsPerBooking, duration, maxDuration} = bookings;
		
		if(enabled && maxParticipantsPerBooking && duration && maxDuration >= duration)
		{
			output = {status: 200}
		}
	}
	
	return output;
}