# ruuvi-streamr

Node.js library for easily getting data from [Ruuvi](https://tag.ruuvi.com) sensors to [Streamr](https://www.streamr.com).

This library simply acts as glue between the Bluetooth sensors and the Streamr API. It listens to data from defined sensor tags, and produces the data to Streamr streams. It will also automatically create and configure the streams if they do not exist.

## Installation

The library can be installed to your project via [npm](https://www.npmjs.com/package/ruuvi-streamr):

`npm install ruuvi-streamr --save`

## Usage

All you need to do is define a mapping from your tag IDs to a name and description, which are used to lookup or create the streams. You also need a Streamr API key which you can create in [user settings](https://www.streamr.com/profile/edit). The library will print to console warnings about undefined tags, allowing you to discover the IDs of your tags if you don't have them yet.

```javascript
// Require the library
const RuuviStreamr = require('ruuvi-streamr')

// Insert your Streamr api key here. You can create one in Settings -> Profile
const apiKey = 'MY-API-KEY'

// Define your tags here. A stream with the tag name will be created, if it does not exist.
// Data from each tag will be produced to its respective stream.
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

// Start!
new RuuviStreamr(apiKey, tags)
```

## Tips for Raspberry Pi

Our RuuviTag demo streams are powered by a Raspberry Pi 3 running Raspbian Linux. The library should also run fine on at least macOS, on which it has been developed.

On the Raspberry Pi, we had to give the following commands to enable listening to Bluetooth as a non-root user:

```
sudo apt-get install libcap2-bin
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
```

In this repository there is also an [example systemd service config](https://github.com/streamr-dev/ruuvi-streamr/blob/master/example.service), which helps set the node process run automatically on boot.
