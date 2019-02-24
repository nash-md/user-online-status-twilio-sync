const fs = require('fs')
const utilRemoteSync = require('./util-remote-sync.js')

module.exports.getConfiguration = function (callback) {

	fs.readFile('user-database.json', 'utf8', function (err, data) {
		if (err) {
			return callback(err)
		}

		try {
			var configuration = JSON.parse(data)
		} catch (exception) {
			return callback(exception)
		}

		callback(null, configuration)
	})

}

module.exports.setConfiguration = function (configuration, callback) {
	let configurationAsString =  JSON.stringify(configuration, null, 4)

	fs.writeFile('user-database.json', configurationAsString, function (err) {
		if (err) {
			callback(err)
		} else {

			// sync state to server
			utilRemoteSync.update(process.env.TWILIO_SYNC_DOCUMENT, configuration)
				.then(doc => {
					callback(null, doc)
				}).catch(error => {
					callback(error)
				})

		}

	})

}

module.exports.setUserState = function (identity, state, callback) {
	console.log('update: ' + identity + ' - state "' + state + '"')

	module.exports.getConfiguration(function (error, configuration) {
		if (error) {
			callback(error)
		} else {

			let user = module.exports.getUser(identity, configuration)

			user.state = state
			user.updatedAt = new Date()

			configuration.users[identity] = user

			module.exports.setConfiguration(configuration, function (error) {
				callback(null)
			})
		}
	})
}

module.exports.updateUserState = function (identity, event, callback) {
	console.log('update: ' + identity + ' - event "' + event + '"')

	module.exports.getConfiguration(function (error, configuration) {
		if (error) {
			callback(error)
		} else {
			let user = module.exports.getUser(identity, configuration)

			switch (event) {
			case 'endpoint_connected':
				user.endpoints++
				break
			case 'endpoint_disconnected':
				user.endpoints--
				break
			default:
				break
			}

			/* no endpoints anymore, set agent offline */
			if (user.endpoints === 0) {
				user.state = 'unavailable'
			}

			/* the agent was offline and now went online, put agent to online */
			if (user.endpoints === 1 && event === 'endpoint_connected') {
				user.state = 'available'
			}

			user.updatedAt = new Date()

			configuration.users[identity] = user

			module.exports.setConfiguration(configuration, function (error) {
				callback(null)
			})
		}
	})

}

module.exports.getUser = function (identity, configuration) {
	let user = null

	if (configuration.users[identity] === undefined) {
		user = { endpoints: 0, state: null }
	} else {
		user = configuration.users[identity]
	}

	return user
}