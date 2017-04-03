/**
 * Created by harihar on 16/06/16.
 */

var request = require('request');
var logger = require('../logger/logger.js').getLogger('snsHandler');

var filterSNSMessage = function (message) {
    console.log("Message Received = ",message);
    console.log("MSG type = ",message['Type']);

    if (message['Type'] === 'SubscriptionConfirmation') {
        var confirmSubscriptioURL = message['SubscribeURL'].toString().trim();
        request(confirmSubscriptioURL, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("***** SUBSCRIPTION Successfull ***** ... \n" ,body);
            }else{
                console.log(error);
            }
        });
    }

    if (message['Type'] === 'Notification') {
        // Do whatever you want with the message body and data.
        console.log(message['MessageId'] + ': ' + message['Message']);
    }


    if (message['Type'] === 'UnsubscribeConfirmation') {
        var confirmUnSubscriptioURL = message['SubscribeURL'].toString().trim();
        request(confirmUnSubscriptioURL, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("***** UN-SUBSCRIPTION Successfull ***** ... \n" ,body);
            }else{
                console.log(error);
            }
        });

    }
};
module.exports.filterSNSMessage = filterSNSMessage;
