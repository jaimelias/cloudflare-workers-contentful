const {isNumber, isValidDateStr, formatDateStr, differenceBetweenDates, capitalize} = Utilities;
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


const sumPriceObjects = arr => {
	
	let output = {};
	
	arr.forEach(priceObj => {
		
		for(let k in priceObj)
		{			
			if(typeof output[k] === 'undefined')
			{
				output[k] = {};
				
				for(let t in priceObj[k])
				{
					const prices = priceObj[k][t];

					if(Array.isArray(prices))
					{
						output[k][t] = [...Array(prices.length)].map(r => 0);
					}
				}
			}
			
			for(let t in priceObj[k])
			{
				const prices = priceObj[k][t];
				
				if(Array.isArray(prices))
				{
					const capitalizeT = capitalize(t);
					
					prices.forEach((v, i) => {

						if(isNumber(v))
						{
							v = v + output[k][t][i];
							
							if(i === 0)
							{
								output[k][`min${capitalizeT}`] = v;
								output[k][`max${capitalizeT}`] = v;
							}							
							
							output[k][`min${capitalizeT}`] = Math.min(output[k][`min${capitalizeT}`], v);
							output[k][`max${capitalizeT}`] = Math.max(output[k][`max${capitalizeT}`], v);
								
							output[k][t][i] = v;
						}
					});					
				}
			}
		}
		
	});
	
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
							minPricesPerPerson: pricePerPerson,
							minFullPrices: fullPrice,
							maxPricesPerPerson: pricePerPerson,
							maxFullPrices: fullPrice	
						};
					}
					
					const {
						minPricesPerPerson, 
						minFullPrices, 
						maxPricesPerPerson, 
						maxFullPrices,
						pricesPerPerson,
						fullPrices
					} = output[s].fixedPrices[p];
					
					output[s].fixedPrices[p] = {
						...output[s].fixedPrices[p],
						pricesPerPerson: [...pricesPerPerson, pricePerPerson],
						fullPrices: [...fullPrices, fullPrice],
						minPricesPerPerson: Math.min(minPricesPerPerson, pricePerPerson),
						minFullPrices: Math.min(minFullPrices, fullPrice),
						maxPricesPerPerson: Math.max(maxPricesPerPerson, pricePerPerson),
						maxFullPrices: Math.max(maxFullPrices, fullPrice)
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
							minPricesPerPerson: pricePerPerson,
							minFullPrices: fullPrice,
							maxPricesPerPerson: pricePerPerson,
							maxFullPrices: fullPrice								
						};
					}
					
					const {
						minPricesPerPerson, 
						minFullPrices, 
						maxPricesPerPerson, 
						maxFullPrices,
						pricesPerPerson,
						fullPrices
					} = output[s].variablePrices[p];
					
					output[s].variablePrices[p] = {
						...output[s].variablePrices[p],
						pricesPerPerson: [...pricesPerPerson, pricePerPerson],
						fullPrices: [...fullPrices, fullPrice],
						minPricesPerPerson: Math.min(minPricesPerPerson, pricePerPerson),
						minFullPrices: Math.min(minFullPrices, fullPrice),
						maxPricesPerPerson: Math.max(maxPricesPerPerson, pricePerPerson),
						maxFullPrices: Math.max(maxFullPrices, fullPrice)
					}
				}
			});
		}

		output[s].subtotal = sumPriceObjects([output[s].variablePrices, output[s].fixedPrices]);
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