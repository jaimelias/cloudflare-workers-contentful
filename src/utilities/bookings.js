const {isNumber} = Utilities;

export const startingAt = bookings => {
	let prices = {};
	
	if(isValidBookingConfig(bookings))
	{
		const {duration, seasons, variablePriceEnabled, variablePriceLast} = bookings;
		
		const prices = getPricesAsObj({seasons, duration, variablePriceEnabled, variablePriceLast});
		
		
		console.log({prices, duration, location: 'utilities/bookings.js'});
	}
	
	
	
	return 0;
};

const getPricesAsObj = ({seasons, duration, variablePriceEnabled, variablePriceLast}) => {
	let prices = {};
	
	for(let k in seasons)
	{
		//fix bug, must be changed to an object to concat later the sum
		prices[k] = 0;

		seasons[k].fixedPrices.forEach(r => {
			
			if(isNumber(prices[k]) && isNumber(r.pax1))
			{
				prices[k] = prices[k] + r.pax1;
			}
		});

		seasons[k].variablePrices.forEach(r => {
			
			if(isNumber(prices[k]) && isNumber(r.pax1))
			{
				duration = (variablePriceLast) ? duration : (duration - 1);
				
				console.log({base: prices[k], variable: r.pax1, duration});
				
				prices[k] = prices[k] + (r.pax1 * duration);
			}
		});
	}

	return prices;
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