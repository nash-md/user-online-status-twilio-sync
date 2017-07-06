const express       = require('express')
const bodyParser    = require('body-parser')
const compression   = require('compression')

const app = express()

app.set('port', (process.env.PORT || 5000))

app.use(compression())
app.use(bodyParser.json({}))
app.use(bodyParser.urlencoded({
	extended: true
}))

const router = express.Router()

const syncCallback = require('./controllers/sync-callback.js')

router.route('/sync-callback').post(syncCallback)

const phone = require('./controllers/phone.js')

router.route('/phone/token').post(phone.token)
router.route('/phone/incoming').get(phone.incoming)
router.route('/phone/status-callback').post(phone.statusCallback)

app.use('/api', router)
app.use('/', express.static(__dirname + '/public'))

app.listen(app.get('port'), function () {
	console.log('magic happens on port', app.get('port'))
})