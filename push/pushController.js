///**
// * Created by harihar on 07/03/16.
// */
//
//
//var userHandler=require('./userHandler');
//
//var pushTextCreator = require('../push/pushTextCreator');
//var gcm = require('node-gcm');
//
//var constants=require('../config/constants');
//var connectionGcm = new gcm.Sender(constants.push_appKey);
//
//var apn = require("apn");
//
//var options = {
//    //keyFile : constants.push_apnsKeyFile,
//    //certFile : constants.push_apnsCertFile,
//    key : constants.push_apnsKeyFile,
//    cert : constants.push_apnsCertFile,
//    //debug : true ,
//    errorCallback : function(error, notification)
//    {
//        logger.err("Error = "+error+". in sending notification = "+notification.toString());
//    } ,
//    passphrase : constants.push_apnsPassPhrase,
//    production: false,
//    //gateway : constants.push_apnsGateway,
//    //port : constants.push_apnsPort
//
//};
//
//var connectionIos = new apn.Connection(options);
//connectionIos.on("connected", function() {
//    console.log("connectionIos Connected");
//});
//
//connectionIos.on("transmitted", function(notification, device) {
//    console.log("connectionIos Notification transmitted to:" + device.token.toString("hex"));
//});
//
//connectionIos.on("transmissionError", function(errCode, notification, device) {
//    console.error("connectionIos Notification caused error: " + errCode + " for device ", device, notification);
//    if (errCode === 8) {
//        console.log("connectionIos A error code of 8 indicates that the device token is invalid. This could be for a number of reasons - are you using the correct environment? i.e. Production vs. Sandbox");
//    }
//});
//
//connectionIos.on("timeout", function () {
//    console.log("connectionIos Connection Timeout");
//});
//
//connectionIos.on("disconnected", function() {
//    console.log("connectionIos Disconnected from APNS");
//});
//
//connectionIos.on("socketError", console.error);
//
//var PushHandler=function(){
//
//}
//
//PushHandler.prototype.sendPush=function(userId, pushPacket,cb){
//
//    logger.info("Sending push 1");
//    userHandler.getUser(userId,false,function(err,user){
//        if(err){
//            logger.err(err);
//            logger.err("USER FIND DB ERROR");
//        }
//        if(!user){
//            logger.err("USER NOT FOUND");
//            cb("USER NOT FOUND");
//        }
//
//        if(user.device_info) {
//
//
//            var token = user.device_info.push_token;
//
//            if(user.device_info.os == 1)
//            {
//
//                var note = new apn.Notification();
//                note.setAlertText(pushPacket.alert);
//                //note.setAlertTitle(pushPacket.alert);
//                note.badge = 1;
//                note.payload = pushTextCreator.getPayload(pushPacket);
//
//                connectionIos.pushNotification(note, token);
//
//            }
//            else {
//                logger.info("Sending push to android");
//                var message = new gcm.Message({
//                    delayWhileIdle: true,
//                    data: pushPacket
//                });
//                var registrationIds = [];
//                registrationIds.push(token);
//                connectionGcm.send(message, registrationIds, 10, function (err, result) {
//                    if (err)
//                    {
//                        console.error(err);
//
//                    }
//                    else
//                    {
//                        console.log(result)
//                    }
//                    cb(err, result.success);
//                });
//            }
//        }
//    })
//}
//
//module.exports=PushHandler;