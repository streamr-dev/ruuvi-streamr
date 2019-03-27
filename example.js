const RuuviStreamr = require('./ruuvi-streamr')

// Insert your Streamr api key here. You can create one in Settings -> Profile
const apiKey = 'MY-API-KEY'

// List your tags here. A stream with the tag name will be created, if it does not exist.
// Data from each tag will be produced to the respective stream.
const tags = {
	'4457e1eccefc425fa577669c62cbb733': {
		name: 'RuuviDemo Zug Fridge',
		description: 'Streamr office fridge in Zug'
	},
	'8955c5f3cd3046e29c3cd2293f1dcbbe': {
		name: 'RuuviDemo Zug Freezer',
		description: 'Streamr office freezer in Zug'
	},
	'6d2b59ffdcc84a759319de9cc3f4086a': {
		name: 'RuuviDemo Zug Meeting Room',
		description: 'Streamr office meeting room in Zug'
	},
	'6ef4bc7d2253474bb19d05769cb7ea76': {
		name: 'RuuviDemo Zug Office',
		description: 'Streamr office in Zug'
	}
}

new RuuviStreamr(apiKey, tags)