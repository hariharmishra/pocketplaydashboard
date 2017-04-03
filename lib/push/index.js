/**
 * Created by SONY on 18-02-2015.
 */

var impl = require('./aerogearSender');


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
    impl.send_to_users(users, message, applicationId, from, cb);
}

/**
 * Sends push to list of app users.
 *
 * @param {String|Array} applications application id or list of application ids to whose users the
 * push has to be sent
 * @param {String} message message to send
 * @param {Function} [cb] optional callback
 */
module.exports.send_to_apps = function(applications, message, cb) {
    impl.send_to_apps(applications, message, cb);
}


/**
 *
 * @param name Name of the event (Tournament start/end, Scheduled. Referral Added/Bonus given. Prize redeemed, voucher sent)
 * @param from It can be Appprix app, Game, A tat user, Admin, Appprix SDK
 * @param to A tat user, users of a game, users of appprix app, categories basically
 * @param message Push message to be sent
 * @param [schedule] Time at which to send the message. If undefined, then will be sent immediately
 */
function scheduleEvent(name, from, to, message, schedule) {

}