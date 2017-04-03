/**
 * Created by Nikhil on 06/05/16.
 */

//var nodemailer = require('nodemailer');
//var smtpTransport = require('nodemailer-smtp-transport');
//
//var transport = nodemailer.createTransport((smtpTransport({
//    service :'Gmail',
//    host: 'yourserver.com',
//    port: 25,
//    auth: {
//        user: 'nikhilbholacse@gmail.com',
//        pass: ''
//    }
//})));
//
///**
// * Send email
// * @param {string} from :sender email id
// * @param {string} to : receiver email id
// * @param {string} subject : email's subject
// * @param {string} message : email's message
// */
//function sendEmail(from, to ,subject,message,cb){
//    transport.sendMail({
//        from: from,
//        to: to,
//        subject: subject,
//        text: message
//    }, function (err,res) {
//        if (err) {
//            cb(err,null);
//        }else{
//            cb(null,res);
//        }
//    });
//
//}
//exports.sendEmail = sendEmail;


/** MailChimp API **/

var MailChimpAPI = require('mailchimp').MailChimpAPI;

var apiKey = 'b30fa37744d0abbefe3787bc8721a862-us13';

var sendMail = function(email,cb){
    try {
        var api = new MailChimpAPI(apiKey, { version : '2.0' });
        api.call('lists', 'subscribe', { id: "13f7eb166c", email: { email: email } }, function (error, data) {
            if (error) {
               // console.log(error.message);
                cb(error.message,null);
                //res.send("error_chimp");
            } else {
               // console.log(JSON.stringify(data));
                cb(null,JSON.stringify(data));
                //  res.send(JSON.stringify(data)); // Do something with your data!
            }
        });
    } catch (error) {
        console.log(error.message);
    }
};

module.exports.sendMail = sendMail;


/**
 * MailGun API
 */


var Mailgun = require('mailgun').Mailgun;

//Your api key, from Mailgun’s Control Panel
var api_key = 'key-5a5583de21471c8d69a57c6bd8e1c175';

//Your sending email address
var from = 'admin@pocketplay.com';



/**
 * Send email using mailgun
 * @param {string} to : receiver email id
 * @param {string} subject : email's subject
 * @param {string} message : email's message
 * @param cb
 */
function sendEmail(to ,subject,message,cb) {
    var mailgun = new Mailgun(api_key);

    mailgun.sendText(from, to, subject, message, function (err) {
        if (err) {
            cb(err, false);
        }
        else {
            cb(null, true);
        }
    });

}
exports.sendEmail = sendEmail;