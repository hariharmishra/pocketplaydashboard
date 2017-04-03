/**
 * Created by harihar on 11/06/16.
 */

var publicSiteDao = require('./publicSiteDao');
var logger = require('../logger/logger.js').getLogger('publicSiteHandler');
var emailUtility = require('../utils/emailUtility');


var contactus = function(request,response){

};





var addSubscriber = function(request,response) {
    var email = request.body.newsletter_email.toString().trim();
    logger.info("Email received for subscription : ", email);
    if (!email) {
        logger.error('Email received is invalid .returning false');
        response.send({"status": 400, "is_subscribed": false});
        response.end();
    } else {
        logger.info("Adding email : ", email ," to pocket play subscribers ...");
        publicSiteDao.addSubscriber(email, function (err, done) {
            if (err) {
                logger.error("Error subscribing email : ", email);
                response.send({"status": 500, "is_subscribed": false});
                response.end();
            } else {
                if (done === true) {
                    logger.info("Email : ", email, " is successfully subscribed.");
                    emailUtility.sendMail(email, function (err, res) {
                        if (err) {
                            logger.error("Mailchimp error : ", err);
                        } else {
                            logger.info("Subscription Email sent: ", res);
                        }
                    });
                }
                else
                    logger.info("Email : ", email, " is already subscribed.");
                response.send({"status": 200, "is_subscribed": done});
                response.end();
            }
        });
    }
};

var removeSubscriber = function(request,response){
    var email = request.body.email ;
    publicSiteDao.removeSubscriber(email,function(err,done) {
        if (err) {
            logger.error("Error un-subscribing email : ",email);
            response.send({"status": 500, "is_unsubscribed": false});
            response.end();
        } else {
            if(done === true)
                logger.info("Email : ",email, " is successfully un-subscribed.");
            else
                logger.info("Email : ",email, " is already un-subscribed.");
            response.send({"status": 200, "is_unsubscribed": done});
            response.end();
        }
    });
};




module.exports.contactus = contactus;
module.exports.addSubscriber = addSubscriber;
module.exports.removeSubscriber = removeSubscriber;