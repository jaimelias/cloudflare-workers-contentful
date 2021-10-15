const {isNumber, isValidDateStr, formatDateStr, differenceBetweenDates, capitalize, getDatesRange} = Utilities;
const variableDurationUnits = ['days', 'nights'];

const parseBookingArgs = ({bookings, request}) => {
		
	const {method, searchParams, apiBody: payload} = request;
	const {variablePricesEnabled, variablePricesLast, durationUnit, maxDuration} = bookings;
	let {duration} = bookings;
	let requestHasDateParams = false;
	let status = 200;
	let startDate = new Date();
	let endDate = new Date();
	
	//startDate.setHours(0);
	//endDate.setHours(0);

	const isVariableDurationUnit = (variablePricesEnabled)
		? variableDurationUnits.includes(durationUnit)
		: false;
		
	let occupancyDuration = (isVariableDurationUnit) 
		? (variablePricesLast) 
		? duration : duration - 1 
		: 1;
	
	if(isVariableDurationUnit)
	{
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
			//console.log({startDate, endDate, duration, occupancyDuration});
		}
		
		//startDate = formatDateStr(startDate);
		//endDate = formatDateStr(endDate);
	}
	
	if(duration > maxDuration)
	{
		status = 400;
		statusText: 'invalid duration param';
	}
	
	const datesRange = (occupancyDuration > 1) ? getDatesRange({startDate, endDate}) : [startDate];
	
	return (status === 200) 
	? {...bookings, startDate, endDate, datesRange, isVariableDurationUnit, duration, status, requestHasDateParams}
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
		const prices = getPricesByDates(bookings);
		console.log(prices);
	}

	return output;
};

const getPricesByDates = bookings => {
	const {seasons, datesRange} = bookings;
	
	if(!seasons.hasOwnProperty('season_1'))
	{
		return;
	}
	
	return datesRange.map((thisDate, dateIndex) => {
		
		let seasonName = 'season_1';
		let obj = {date: thisDate};
		
		for(let s in seasons)
		{
			const {dates} = seasons[s] || [];
			
			dates.forEach(d => {
				let {to, from} = d || '';
				
				to = (to) ? new Date(to) : '';
				from = (from) ? new Date(from) : '';
				
				if(to && from)
				{
					if(thisDate >= from && thisDate <= to)
					{
						seasonName = s;
					}
				}
			});
		}
		
		const {fixedPrices, variablePrices} = seasons[seasonName];
		
		if(dateIndex === 0)
		{
			obj.fixedPrices = fixedPrices;
		}
		
		obj = {...obj, variablePrices, seasonName};

		return obj;
	});
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