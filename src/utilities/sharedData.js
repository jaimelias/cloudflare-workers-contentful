export const accommodationTypes = ['Accommodation', 'Hotel', 'Resort'];

export const formFields = {
	token: {
		required: true,
		validator: 'recaptcha',
	},
	language: {
		minLength: 2,
		maxLength: 2
	},
	startDate: {
		minLength: 10,
		maxLength: 10
	},
	endDate: {
		minLength: 10,
		maxLength: 10
	},
	pax1: {
		validator: 'isNumber',
		min: 1,
		max: 12
	},
	email: {
		required: true,
		validator: 'isEmail'
	},
	telephone: {
		required: true,
		minLength: 6,
		maxLength: 25
	},
	firstName: {
		required: true,
		minLength: 2,
		maxLength: 20		
	},
	lastName: {
		required: true,
		minLength: 2,
		maxLength: 20
	},
	message: {
		required: true,
		minLength: 6,
		maxLength: 1000
	}
};