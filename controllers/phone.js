const twilio = require('twilio')

let AccessToken = twilio.jwt.AccessToken
let SyncGrant = AccessToken.SyncGrant

const util = require('./../util-file.js')

module.exports.incoming = function (req, res) {
	console.log('Phone: Inbound Call for: ' + req.query.name)

	util.getConfiguration(function (error, configuration) {
		let user = util.getUser(req.query.name, configuration)
		let twiml = new twilio.twiml.VoiceResponse()
		let dial = null

		switch (user.status) {
		case 'online':
			dial = twiml.dial({})

			dial.client({
				statusCallback: `${req.protocol}://${req.hostname}/api/phone/status-callback`,
				statusCallbackEvent: 'ringing answered completed'
			}, req.query.name)
			break

		case 'offline':
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
	console.log('Phone: Status Callack CallSid: ' + req.body.CallSid + ' name: ' + req.body.To.substr(7) + ' status: ' + req.body.CallStatus)

	const status = req.body.CallStatus
	const name = req.body.To.substr(7)

	switch (status) {
	case 'no-answer':
		// set state to idle
		util.setUserStatus(name, 'online', function (error) {
			if (error) {
				console.log(error)
			}
		})
		break

	case 'completed':
		// set state to idle
		util.setUserStatus(name, 'online', function (error) {
			if (error) {
				console.log(error)
			}
		})
		break

	case 'ringing':
		// set state to idle
		util.setUserStatus(name, 'busy', function (error) {
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
	const lifetime = 1800

	// create a unique ID for the client on their current device
	let endpointId = `TwilioSyncDemo::${req.body.identity}:${req.body.endpoint}`

	/* create token for Twilio Sync 	 */
	let syncGrant = new SyncGrant({
		serviceSid: process.env.TWILIO_SYNC_SERVICE_SID,
		endpointId: endpointId
	})

	let accessToken = new AccessToken(
		process.env.TWILIO_ACCOUNT_SID,
		process.env.TWILIO_API_KEY_SID,
		process.env.TWILIO_API_KEY_SECRET,
		{ ttl: lifetime })

	accessToken.addGrant(syncGrant)
	accessToken.identity = req.body.identity

	/* create a token for Twilio Client */
	const ClientCapability = twilio.jwt.ClientCapability

	/* create a token for Twilio Client */
	const phoneCapability = new ClientCapability({
		accountSid: process.env.TWILIO_ACCOUNT_SID,
		authToken: process.env.TWILIO_AUTH_TOKEN,
		ttl: lifetime
	})

	phoneCapability.addScope(new ClientCapability.IncomingClientScope(req.body.identity))

	const tokens = {
		phone: phoneCapability.toJwt(),
		sync: accessToken.toJwt()
	}

	res.json({ tokens: tokens, documentName: process.env.TWILIO_SYNC_DOCUMENT })
}
