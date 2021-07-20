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

export const startingAt = ({bookings, request}) => {
	
	const validateConfig = isValidBookingConfig(bookings);
	
	if(validateConfig.status === 200)
	{
		bookings = parseBookingArgs({bookings, request});
		
		const prices = parseAllPrices(bookings);
	}

	return validateConfig;
};

const parseAllPrices = bookings => {
	
	//This function sums fixed + (variable * duration) of each price type of each season
	
	const {seasons, duration, variablePricesEnabled} = bookings;
	
	let output = {};
	
	for(let s in seasons)
	{
		const {fixedPrices, variablePrices, dates} = seasons[s];
		output[s] = {dates, prices: {}};
		
		if(Array.isArray(fixedPrices))
		{
			fixedPrices.forEach((price, i) => {
				
				for(let p in price)
				{
					if(typeof output[s].prices[p] === 'undefined')
					{
						output[s].prices[p] = [...Array(fixedPrices.length)].map(r => 0);
					}
					
					output[s].prices[p][i] = isNumber(price[p]) ? price[p] : 0;
				}
			});			
		}

		if(Array.isArray(variablePrices) && variablePricesEnabled)
		{
			variablePrices.forEach((price, i) => {
				
				for(let p in price)
				{
					if(isNumber(price[p]))
					{
						
						if(typeof output[s].prices[p] === 'undefined')
						{
							output[s].prices[p] = [...Array(variablePrices.length)].map(r => 0);
						}
						
						output[s].prices[p][i] += price[p] * duration;
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