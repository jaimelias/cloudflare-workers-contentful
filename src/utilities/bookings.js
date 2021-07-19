const {isNumber, isValidDateStr, formatDateStr} = Utilities;
const variableDurationUnits = ['days', 'nights'];

const parseBookingArgs = ({bookings, request}) => {
	const {variablePricesEnabled, variablePricesLast, durationUnit, duration} = bookings;
	const {method, searchParams, apiBody: payload} = request;
	let startDate = new Date();
	let endDate = new Date();
	
	const isVariableDurationUnit = (variablePricesEnabled) 
		? variableDurationUnits.includes(durationUnit)
		: false;
				
	if(method === 'GET')
	{
		if(searchParams.has('startDate') && searchParams.has('endDate'))
		{
			startDate = (isValidDateStr(searchParams.get('startDate'))) 
				? new Date(searchParams.get('startDate'))
				: startDate;
			
			endDate = (isValidDateStr(searchParams.get('endDate'))) 
				? new Date(searchParams.get('endDate'))
				: startDate;
		}
	}
	else if(method === 'POST')
	{
		if(typeof payload === 'object')
		{
			startDate = (isValidDateStr(payload.startDate)) 
				? new Date(payload.startDate)
				: startDate;
			
			endDate = (isValidDateStr(payload.endDate)) 
				? new Date(payload.endDate)
				: startDate;			
		}
	}
	
	startDate = formatDateStr(startDate.setHours(0));
	endDate = formatDateStr(endDate.setHours(0));
	
	let variablePriceDuration = (isVariableDurationUnit) 
		? (variablePricesLast) 
		? duration
		: (duration - 1)
		: 0;	

	console.log('editing bookings.js:parseBookingArgs');
	console.log({startDate, endDate, variablePriceDuration});

	return {...bookings, startDate, endDate, isVariableDurationUnit, variablePriceDuration};
};

export const startingAt = ({bookings, request}) => {
	
	if(isValidBookingConfig(bookings))
	{
		bookings = parseBookingArgs({bookings, request});
		
		const prices = parseAllPrices(bookings);
	}

	return 0;
};

const parseAllPrices = bookings => {
	
	//This function sums fixed + (variable * variablePriceDuration) of each price type of each season
	
	const {seasons, variablePriceDuration, variablePricesEnabled} = bookings;
	
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
						
						output[s].prices[p][i] += price[p] * variablePriceDuration;
					}
				}
			});
		}
		
	}

	return output;
};

const isValidBookingConfig = bookings => {
	
	if(typeof bookings === 'object')
	{
		const {enabled, maxParticipantsPerBooking, duration} = bookings;
		
		if(enabled && maxParticipantsPerBooking && duration)
		{
			return true;
		}
	}
	
	return false;
}