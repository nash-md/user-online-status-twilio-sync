const twilio = require('twilio')

const AccessToken = twilio.jwt.AccessToken
const SyncGrant = AccessToken.SyncGrant
const VoiceGrant = AccessToken.VoiceGrant

const util = require('./../util-file.js')

module.exports.outgoing = function (req, res) {
	console.log('Phone: Outbound Call to: ' + req.body.phoneNumber)

	util.getConfiguration(function (error, configuration) {
		let twiml = new twilio.twiml.VoiceResponse()
		let dial = null

		dial = twiml.dial({})

		dial.number({
			statusCallback: `${req.protocol}://${req.hostname}/api/phone/status-callback`,
			statusCallbackEvent: 'initiated completed'
		}, req.body.phoneNumber)

		console.log('TwiML: ' + twiml.toString())

		res.setHeader('Content-Type', 'application/xml')
		res.setHeader('Cache-Control', 'public, max-age=0')
		res.send(twiml.toString())
	})

}

module.exports.incoming = function (req, res) {
	console.log('Phone: Inbound Call for: ' + req.query.name)

	util.getConfiguration(function (error, configuration) {
		let user = util.getUser(req.query.name, configuration)
		let twiml = new twilio.twiml.VoiceResponse()
		let dial = null

		switch (user.state) {
		case 'available':
			dial = twiml.dial({})

			dial.client({
				statusCallback: `${req.protocol}://${req.hostname}/api/phone/status-callback`,
				statusCallbackEvent: 'initiated completed'
			}, req.query.name)
			break

		case 'unavailable':
			twiml.say('The user is offline right now')
			break

		case 'busy':
			twiml.say('The user is busy right now')
			break

		default:
			twiml.say('Sorry, this user is unknown')
			break
		}

		console.log('TwiML: ' + twiml.toString())

		res.setHeader('Content-Type', 'application/xml')
		res.setHeader('Cache-Control', 'public, max-age=0')
		res.send(twiml.toString())
	})

}

module.exports.statusCallback = function (req, res) {
	let identity = null

	if (req.body.From.includes('client')) {
		identity = req.body.From.substr(7)
	} else {
		identity = req.body.To.substr(7)
	}

	console.log(`Phone: Status Callback CallSid: ${req.body.CallSid} identity: ${identity} status: ${req.body.CallStatus}`)

	const status = req.body.CallStatus

	switch (status) {
	case 'completed':
		util.setUserState(identity, 'available', function (error) {
			if (error) {
				console.log(error)
			}
		})
		break

	case 'no-answer':
		util.setUserState(identity, 'available', function (error) {
			if (error) {
				console.log(error)
			}
		})
		break

	case 'busy':
		util.setUserState(identity, 'available', function (error) {
			if (error) {
				console.log(error)
			}
		})
		break

	case 'initiated':
		util.setUserState(identity, 'busy', function (error) {
			if (error) {
				console.log(error)
			}
		})
		break

	default:
		break
	}

	res.setHeader('Content-Type', 'application/xml')
	res.status(200).end()
}

module.exports.token = function (req, res) {
	const lifetime = 3600

	// create a unique ID for the client on their current device
	let endpointId = `TwilioSyncDemo::${req.body.identity}:${req.body.endpoint}`

	let accessToken = new AccessToken(
		process.env.TWILIO_ACCOUNT_SID,
		process.env.TWILIO_API_KEY_SID,
		process.env.TWILIO_API_KEY_SECRET,
		{ ttl: lifetime })

	accessToken.identity = req.body.identity

	/* create token for Twilio Sync */
	let syncGrant = new SyncGrant({
		serviceSid: process.env.TWILIO_SYNC_SERVICE_SID,
		endpointId: endpointId
	})

	/* create token for Twilio Client */
	const voiceGrant = new VoiceGrant({
		incomingAllow: true,
		outgoingApplicationSid: process.env.TWILIO_APPLICATION_SID
	})

	accessToken.addGrant(voiceGrant)
	accessToken.addGrant(syncGrant)

	res.json({ token: accessToken.toJwt(), documentName: process.env.TWILIO_SYNC_DOCUMENT })
}
