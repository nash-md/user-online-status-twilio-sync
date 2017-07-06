const util = require('./../util-file.js')

module.exports = function (req, res) {
	console.log('Sync - EndpointId:' + req.body.EndpointId + ' EventType: ' + req.body.EventType)

	if (req.body.EventType === 'endpoint_connected' || req.body.EventType === 'endpoint_disconnected') {
		util.updateUserStatus(req.body.Identity, req.body.EventType, function (error) {
			if (error) {
				console.log(error)
				res.status(500).end()
			} else {
				res.status(200).end()
			}
		})
	} else {
		res.status(200).end()
	}

}
