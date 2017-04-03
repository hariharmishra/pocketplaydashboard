var agSender = require( "unifiedpush-node-sender" );
var _ = require('underscore');
var aerogearConfig = require("./aerogearConfig");

var log_prefix = 'PUSH-SENDER >'
// initialize push sender
var Push = initialize();

/**
 * Sends push to list of users or single user.
 *
 * @param {String|Array} users username or array of usernames
 * @param {String} message message to send
 * @param {String} applicationId Application id of the user
 * @param {String} [from] username of user who initiated the push or null, if this is from application
 * @param {Function} [cb] optional callback
 */
module.exports.send_to_users = function(users, message, applicationId, from, cb) {
	var error;
	if(!users || users == []) {
		error = 'Recipient data missing';
	}

	if(message == null || typeof message != 'string' || message == '') {
		error = 'Push message empty/invalid';
	}

	if(!applicationId) {
		error = 'Sending Application id missing';
	}

	if(error) {
		setImmediate(function() {
			console.info(log_prefix, error, message);
			cb(error);
		})
		return;
	}

	var callback, fromApp;
	if(typeof from === 'function') {
		fromApp = null;
		callback = from;
	}

	callback = callback || defaultCallback;

	if(typeof users === 'string') {
		users = [users];
	}

	var apps = [applicationId];

	sendPush(apps, users, message, fromApp, callback);
};

/**
 * Sends push to list of app users.
 *
 * @param {String|Array} applications application id or list of application ids to whose users the
 * push has to be sent
 * @param {String} message message to send
 * @param {Function} [cb] optional callback
 */
module.exports.send_to_apps = function(applications, message, cb) {
	var error;
	if(!applications || applications == []) {
		error = 'Recipient data missing';
	}

	if(message == null || typeof message != 'string' || message == '') {
		error = 'Push message empty/invalid';
	}

	if(error) {
		setImmediate(function() {
			logger.warn(log_prefix, error, message);
			cb(error);
		})
		return;
	}

	var callback = cb || defaultCallback;

	if(typeof applications === 'string') {
		applications = [applications];
	}

	sendPush(applications, null, message, null, callback);
};


/**
 *
 * @param categories
 * @param alias
 * @param text
 * @param from
 * @param cb
 */
function sendPush(categories, alias, text, from, cb){

	var settings = getSettings(categories, alias);

	// build message with alert, timestamp, and ttl
	//var message =  {alert: text, t: Date.now(), f: from || aerogearConfig.name, data: {alert: 'sdasdasd ggg'}};


	var message =
	{
			alert: 'Deven Singh: Challenged you to play Connect 4',
			base: 'user_id: Challenged you to play game_id',
			user_id: '56dbdb69ac1b8075652e0bd8',
			game_id: '99c5ff9526463db41a181125',
			user_name: 'Deven Singh',
			game_name: 'Connect4',
			table_id: '56dd5308ac1b8075652e1e05',
			push_type: 0

	};

	console.log('Sending push with ', settings, message);
	Push.sender.send(message, settings)
		.on( "success", function( response ) {
			console.log(log_prefix, 'Send', response);
			cb(null,response, text);
		})
		.on("error",function(error){
			console.log(log_prefix, 'Error sending Push', error);
			cb(error, null, text);
		});
}


function initialize() {
	var setup = {};

	console.log('SEnder initialized with: ' + aerogearConfig.url)
	setup.sender = agSender.Sender(aerogearConfig);
	setup.config = aerogearConfig;
	//logger.info(log_prefix, 'Push Sender initialized with config', aerogearConfig);

	return setup;
}

function getSettings(categories, alias) {
	var settings = {};

	settings.applicationID = Push.config.applicationID;
	settings.masterSecret = Push.config.masterSecret;

	settings.criteria = {alias: alias || [], categories: categories || [], variants: null, deviceType: null};

	return settings;
}

function defaultCallback(err, response, data) {
	if(err) {
		console.log('AERO - Error sending push', err, data);
	} else {
		console.log('AERO - Push sent successfully', data, response);
	}
}