const querystring = require('querystring')
const ruuvi = require('node-ruuvitag')
const fetch = require('node-fetch')
const debug = require('debug')('RuuviStreamr')

class RuuviStreamr {

	constructor(apiKey, tags = {}, url = 'https://www.streamr.com/api/v1') {
		if (!apiKey) {
			throw 'Streamr API key must be given!'
		}
		if (!tags || !Object.keys(tags).length) {
			console.log('Warning: No tags are defined!')
		}

		this.apiKey = apiKey
		this.tags = tags
		this.url = url

		// This object will cache the stream ids for the tags
		this.streams = {}

		// Set of tags we have already warned about, to avoid warning many times
		this.warned = {}

		// Set of tags we are currently creating, to avoid creating multiple times
		this.creating = {}

		this.start()
	}

	start() {
		// Listen to data from RuuviTags
		ruuvi.on('found', tag => {
			console.log('Found tag: '+tag.id+ (this.tags[tag.id] ? ' ('+this.tags[tag.id].name+')' : ''))

			tag.on('updated', async (data) => {
				// Warn once if the tag is not defined in tags.js
				if ((!this.tags[tag.id] || !this.tags[tag.id].name)) {
					if (!this.warned[tag.id]) {
						console.log('Warning: Ignoring tag %s because it is not defined in the "tags" argument to RuuviStreamr(apiKey, tags): %s', tag.id, JSON.stringify(data, null, '\t'))
						this.warned[tag.id] = true
					}
					return
				}

				let tagDef = this.tags[tag.id]
				debug('%s: %s', tagDef.name, JSON.stringify(data, null, '\t'))
				try {
					let stream = await this.getOrCreateStream(tagDef.name, tagDef.description)
					await this.produceToStream(stream.id, data)

					if (!stream.config.fields || !stream.config.fields.length) {
						try {
							this.streams[tagDef.name] = await this.detectFields(this.streams[tagDef.name].id)
							this.updateStream(this.streams[tagDef.name])
						} catch (err) {
							// ignore
						}
					}
				} catch (err) {
					console.error(err)
				}
			})
		})

		console.log("Listening for RuuviTags...")
	}

	async getStreamByName(name) {
		let url = this.url + '/streams?' + querystring.stringify({
			name: name,
			public: false
		})
		let json = await this.authFetch(url)
		return json[0]
	}

	async createStream(name, description) {
		this.creating[name] = true
		try {
			return await this.authFetch(this.url + '/streams', {
				method: 'POST',
				body: JSON.stringify({name, description})
			})
		} finally {
			delete this.creating[name]
		}
	}

	async updateStream(stream) {
		return await this.authFetch(this.url + '/streams/' + stream.id, {
			method: 'PUT',
			body: JSON.stringify(stream)
		})
	}

	async getOrCreateStream(name, description) {
		// Try cache first
		if (this.streams[name]) {
			return this.streams[name]
		}

		// Then try looking up the stream
		this.streams[name] = await this.getStreamByName(name)
		
		// If not found, try creating the stream
		if (!this.streams[name] && !this.creating[name]) {
			this.streams[name] = await this.createStream(name, description)
			console.log('Created stream: %s (%s)', name, this.streams[name].id)
		}

		// If still nothing, throw
		if (!this.streams[name]) {
			throw "Unable to find or create stream: " + name
		} else {
			return this.streams[name]
		}
	}

	async produceToStream(streamId, data) {
		// Send data to the stream
		return await this.authFetch(this.url + '/streams/' + streamId + '/data', { 
			method: 'POST',
			body: JSON.stringify(data)
		})
	}

	async authFetch(url, opts = {}) {
		let res = await fetch(url, {
			headers: {
				Authorization: 'token '+this.apiKey
			},
			...opts
		})

		let text = await res.text()

		if (res.ok && text.length) {
			try {
				return JSON.parse(text)
			} catch (err) {
				throw 'Failed to parse JSON response: '+text
			}
		} else if (res.ok) {
			return {}
		} else {
			throw 'Request to '+url+' returned with error code '+res.status+': '+text
		}
	}

	async detectFields(streamId) {
		return await this.authFetch(this.url + '/streams/' + streamId + '/detectFields')
	}

}

module.exports = RuuviStreamr