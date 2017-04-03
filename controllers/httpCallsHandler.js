///**
// * Created by harihar on 11/04/16.
// */
//
//// Http post to another server ip.
//var request = require('request');
//var httpTransactions = require('../database/models/httpTransactions');
//var failedHttpTransactions =  require('../database/models/failedHttpTransactions');
//var httpCallsConfig = require('../config/httpCallsConfiguration');
//var constants = require('../config/constants');
//var logger = require('../logger/logger.js').getLogger('httpCallsHandler');
//
//
//var currentURL = constants.INTER_SERVER_HTTP_POST_URL;
//logger.info('HTTP post url set to : ' ,currentURL);
//
//var retryTimer ;
//
//var postToURL = function postToURL(url , body , method , cb) {
//
//
//    var options = {};
//    options.body = body;
//    options.json = true;
//    options.url = url;
//    options.method = method;
//    options.timeout = 60000;
//
//    logger.info('Received postToURL request.Options object ='+ JSON.stringify(options));
//
//    request(url, options, function (error, response) {
//
//        var logObject = {};
//        logObject.tranx_type = body.request_type;
//        logObject.request_url = url;
//        logObject.sender_ip = 'localhost';
//        logObject.receiver_ip = currentURL;
//
//
//        if (error) {
//
//            logObject.status_code = '500';
//            logObject.message = 'SERVER ERROR : Http request failed.';
//
//            logFailedTransactionToDB(logObject, function(err ,done){
//                cb(error, response);
//            });
//            retryHttpRequest(logObject);
//        }
//        else {
//
//        // cancel setTimeout() if any , on response received.
//            clearTimeout(retryTimer);
//
//            logObject.status_code = response.statusCode;
//            logObject.message = 'Http request successfull for '+ logObject.tranx_type;
//
//            logTransactiontoDB(logObject,function(err ,done){
//                cb(error, response);
//            });
//
//        }
//
//    });
//};
//
//
//
//
//var retryCounter = 0;
//var retryDelay = 2000;  // milliseconds
//
//function retryHttpRequest(body){
//    if(retryCounter > 5 ){
//        logger.info('RETRIED POST TO URL ' + retryCounter + ' TIMES.Logging to database...\n');
//        logTransactiontoDB(err,null);
//    }
//    else {
//        retryCounter++;
//        retryTimer = setTimeout(postToURL(body),retryDelay);
//    }
//}
//
//
//function logTransactiontoDB(logObject ,cb) {
//
//    var transxnObj = {};
//
//    transxnObj.tranx_type = logObject.tranx_type;
//    transxnObj.status_code = logObject.status_code;
//    transxnObj.message = logObject.message;
//    transxnObj.request_url = logObject.request_url;
//    transxnObj.sender_ip = logObject.sender_ip;
//    transxnObj.receiver_ip = logObject.receiver_ip;
//    transxnObj.timeStamp = new Date().getTime();
//
//    var httpTranxn = new httpTransactions(transxnObj);               // create new schema instance of httpTransactions
//
//    httpTranxn.save( function (err, queryResult) {
//        if (err) {
//            logger.error("Unable to log request to database !!!",err);
//            cb(err,null);
//        }
//        else {
//            logger.info("Http inter server transaction of type : "+ logObject.tranx_type + " successfully logged to database .Transaction id: ",queryResult._id.toString());
//            cb(null,true);
//        }
//    });
//
//}
//
//var makeHttpRequest = function makeHttpRequest(data , method, cb){
//
//    var url ;
//    var requestType = data.requestType ;
//    var payLoad = data.payLoad;
//    var body;
//
//    url = currentURL + '/send-data';
//    body = {"request_type": requestType};
//    if(payLoad)
//    {
//        body['data'] = payLoad;
//    }
//    method = 'post';
//
//    postToURL(url,body,method,function(err,resp){
//        if(err){
//            cb(err,null);
//        }
//        else {
//            cb(null,resp);
//        }
//    });
//
//};
//
//
//
//
//// HTTP CALLS FOR QA TO LIVE SERVER
//
//
//sendDataToLiveServer = function sendDataToLive(data ,url ,method, cb) {
//
//    var options = {};
//    options.body = data;
//    options.json = true;
//    options.url = url;
//    options.method = method;
//   // options.timeout = 5000;
//
//    request(url, options, function (error, response) {
//
//        if (error) {
//           // console.log("error", error);
//            cb(error,null);
//        }
//        else {
//           // console.log('response', response);
//            cb(null,response.body)
//        }
//
//    });
//
//
//};
//
//
//function logFailedTransactionToDB(logObject){
//    var transxnObj = {};
//
//    transxnObj.tranx_type = logObject.tranx_type;
//    transxnObj.tranx_id = new Date().getTime().toString(12);
//    transxnObj.status_code = logObject.status_code;
//    transxnObj.message = logObject.message;
//    transxnObj.request_url = logObject.request_url;
//    transxnObj.sender_ip = logObject.sender_ip;
//    transxnObj.receiver_ip = logObject.receiver_ip;
//    transxnObj.timeStamp = new Date().getTime();
//
//    var failedHttpTranxn = new failedHttpTransactions(transxnObj);               // create new schema instance of FailedHttpTransactions
//
//    failedHttpTranxn.save( function (err, queryResult) {
//        if (err) {
//            logger.error("Unable to log request to database !!!",err);
//            cb(err,null);
//        }
//        else {
//            logger.info("Http inter server transaction of type : "+ logObject.tranx_type + " successfully logged to database .Transaction id: ",queryResult._id.toString());
//            cb(null,true);
//        }
//    });
//
//}
//
//
///**
// * MODULE EXPORTS
// */
//
//module.exports.postToURL = postToURL;
//module.exports.makeHttpRequest = makeHttpRequest ;
//module.exports.sendDataToLiveServer = sendDataToLiveServer ;
//
//
//
//

// Http post to another server .
var request = require('request');
var httpTransactions = require('../database/models/httpTransactions');
var constants = require('../config/constants');
var logger = require('../logger/logger.js').getLogger('httpCallsHandler');
var httpCallsConfig = require('../config/httpCallsConfiguration.js');
var emailUtility = require('../utils/emailUtility');


var currentURL = constants.INTER_SERVER_HTTP_POST_URL;
//var currentURL = 'http://52.86.35.40:4000';//testing purpose...fake ip
logger.info('HTTP post url set to : ' ,currentURL);

var retryTimer ;
var timeout_handles ={};

var postToURL = function postToURL(requestParams, cb) {


    var options = {};
    if (typeof requestParams.request_body === 'string')
        requestParams.request_body = JSON.parse(requestParams.request_body);
    options.body = requestParams.request_body;
    options.json = true;
    options.url = requestParams.request_url;
    options.method = requestParams.request_method;
    options.timeout = retryDelay;        // Time in milliseconds ...

    console.log("Request Body : ", JSON.stringify(options.body));
    if (Object.keys(timeout_handles).length !== 0 && timeout_handles.constructor === Object){
        if (requestParams.request_body.request_type === requestParams.retryTimerId) {

            console.log("Deleting key ", requestParams.retryTimerId);
            clearTimeout(timeout_handles[requestParams.retryTimerId]);
            delete timeout_handles[requestParams.retryTimerId];
        }
    }



    request(options.url, options, function (error, response) {

        var logObject = {};
        logObject.tranx_type = requestParams.request_body.request_type;
        logObject.request_body = JSON.stringify(requestParams.request_body);
        logObject.request_url = requestParams.request_url;
        logObject.tranx_id = requestParams.tranx_id ;
        logObject.sender_ip = 'localhost';
        logObject.receiver_ip = currentURL;
        logObject.request_method = requestParams.request_method;
        logObject.retryTimerId = requestParams.retryTimerId;

        if (error) {

            logObject.status_code = '500';
            logObject.request_status = constants.HTTP_REQUEST_STATUS.RETRYING;
            logObject.message = 'SERVER ERROR : Http request failed.';

            logTransactiontoDB(logObject, function(err ,done){
                if(err){
                    logger.error('unable to log transaction type %s to db ',logObject.tranx_type,err);
                    cb(err,{statusCode:500});
                }else{

                    done.retryTimerId = logObject.retryTimerId;
                    if(done.retryCount == 0){
                        logger.info("Sending Response back to client : ",{statusCode:500});
                        cb(null, {statusCode:500});
                    }

                    if(done.retryCount <=5){
                        logger.error('Retrying...',done.retryCount);
                        retryHttpRequest(done);
                    }

                  }
            });
        }
        else {
            if (logObject.tranx_type === httpCallsConfig.DELETE_USER_FROM_REDIS && logObject.tranx_id) {
                removeProfileViewLog(logObject.tranx_id);
            }
            logger.info('Inter Server Http Request with body %s for type %s was successful.Status Code : ', JSON.stringify(options.body), logObject.tranx_type, 200);
            if(logObject.tranx_type === httpCallsConfig.USER_PROFILE_PIC_UPDATED){
              //  console.log("Response Body for Profilepic " ,response.body);
                cb(null, {statusCode: 200,image_text_version:response.body.image_text_version});
            }else{
                cb(null, {statusCode: 200});
            }


        }
    });
};


function removeProfileViewLog(tranxnId) {

   // var profileViewArray = requestBody.data.profileViewArray;
   // console.log(profileViewArray);

    httpTransactions.remove({tranx_id: tranxnId}, function (err, logRecord) {
        if (err) {
            logger.error("Error deleting failed http transaction", err);
        } else {
            logger.info("Successfully deleted Failed http transaction after successful update");
        }
    });


}


var retryDelay = 5000;  // milliseconds

function retryHttpRequest(logObject){

    if( timeout_handles[logObject.retryTimerId])
    {
       // console.log("Deleting key ",logObject.retryTimerId);
        clearTimeout( timeout_handles[logObject.retryTimerId] );
        delete timeout_handles[logObject.retryTimerId];
    }


    if(logObject.retryCount && logObject.retryCount == 5 ) {
        logger.info('RETRIED POST TO URL ' + logObject.retryCount + ' TIMES.Logging to database...\n');
        //send email to admin
        emailUtility.sendEmail('nikhil@lambentgamestudio.com',
            'HTTP request failed on server : '+constants.SERVER_IP.toString(),
            'Retried Http request of type : '+ logObject.tranx_type + ' with id : ' + logObject.tranx_id, function (err, resp) {
                if (err) {
                    logger.err("Unable to lodge email to admin", err);
                } else {
                    logger.info('Email successfully sent to admin');
                }
            });
        logger.info("Retried request with id : %s upto %s times .Sending mail to admin. ", logObject.tranx_id, logObject.retryCount);
    }
    else if(logObject.retryCount && logObject.retryCount < 5 ) {

        logObject["retryTimerId"] = logObject.tranx_type;
        logger.info("Retrying type %s again after",logObject.tranx_type,retryDelay);
        retryTimer = setTimeout(postToURL(logObject),retryDelay);
        timeout_handles[logObject.tranx_type] = retryTimer;
    }
}


function logTransactiontoDB(logObject ,cb) {
    httpTransactions.findOne({tranx_id: logObject.tranx_id}, function (err, logRecord) {
        if (err) {
            logger.error("error finding failed http transaction",err);
            cb(err,null);
        } else {
            if (logRecord) {
                // Failed Record exists , update it
                logRecord.request_body = logObject.request_body;
                logRecord.retryCount ++;

                logRecord.timestamp = new Date();
                logRecord.save(function(err,done){
                    if (err) {
                        logger.error("Unable to log request to database !!!", err.stack);
                        cb(err, null);
                    }
                    else {
                        logger.info("Http inter server transaction of type : " + logRecord.tranx_type + " successfully updated to database .Transaction id: ", logRecord._id.toString());
                        cb(null, logRecord.toJSON());
                    }
                });

            } else {
                // Add new failed record.

                var transxnObj = {};
                transxnObj.tranx_id = new Date().getTime().toString(12);
                transxnObj.tranx_type = logObject.tranx_type;
                transxnObj.retryCount = 1;
                transxnObj.request_method = logObject.request_method;
                transxnObj.request_body = logObject.request_body;
                transxnObj.status_code = logObject.status_code;
                transxnObj.message = logObject.message;
                transxnObj.request_url = logObject.request_url;
                transxnObj.sender_ip = logObject.sender_ip;
                transxnObj.receiver_ip = logObject.receiver_ip;
                transxnObj.timeStamp = new Date().getTime();

                var httpTranxn = new httpTransactions(transxnObj);    // create new schema instance of httpTransactions

                httpTranxn.save(function (err, queryResult) {
                    if (err) {
                        logger.error("Unable to log request to database !!!", err.stack);
                        cb(err, null);
                    }
                    else {
                        logger.info("Http inter server transaction of type : " + logObject.tranx_type + " successfully logged to database .Transaction id: ", queryResult._id.toString());
                        cb(null, queryResult.toJSON());
                    }
                });
            }
        }
    });
}

var makeHttpRequest = function makeHttpRequest(data , method, cb){

    var url ;
    var requestType = data.requestType ;
    var payLoad = data.payLoad;
    var body;

    url = currentURL + '/send-data';
    body = {"request_type": requestType};
    if(payLoad)
    {
        body['data'] = payLoad;
    }
    method = 'post';

  //  console.log("Body Received: ",JSON.stringify(body));

    var reqObject ={};
    reqObject.request_url = url;
    reqObject.request_body = body;
    reqObject.request_method = method;
    reqObject.tranx_id = null;
    checkForExistingRequestInQueue(requestType,function(err,res){
        if(err){
            cb(err,null);
        }else{
            if(res === false){
                postToURL(reqObject,function(err,resp){
                    if(err){
                        cb(err,null);
                    }
                    else {
                        cb(null,resp);
                    }
                });
            }else{

                res.retryCount = 0;
                if(res.tranx_type == httpCallsConfig.DELETE_USER_FROM_REDIS )
                {
                    var rb = JSON.parse(res.request_body);
                  //  console.log("RB == > ",rb.data.profileViewArray,typeof rb.data.profileViewArray ,rb.data.profileViewArray.length);
                    var flag = 1 ;
                    for(var index =0;index < rb.data.profileViewArray.length ;index++) {
                      //  console.log("index---",index);
                        if (rb.data.profileViewArray[index].id == body.data.profileViewArray[0].id) {
                            console.log("*****Match Found*****");
                            rb.data.profileViewArray[index].profile_view += body.data.profileViewArray[0].profile_view;
                            flag = 0;
                            break;
                        }
                    }
                    if(flag === 1){
                        console.log("***NO Match Found****");
                        rb.data.profileViewArray.push(body.data.profileViewArray[0]);
                    }
                    reqObject.request_body = rb;
                    res.request_body = JSON.stringify(rb);
                  //  console.log("NEW RES : === ",res );
                }
                res.save(function(err,result){
                    if(err){
                        cb(err,null);
                    }else {
                        reqObject.tranx_id = res.tranx_id;
                        postToURL(reqObject, function (err, resp) {
                            if (err) {
                                cb(err, null);
                            }
                            else {
                                cb(null, resp);
                            }
                        });
                    }
                });

            }

        }
    });


};



function checkForExistingRequestInQueue(requestType,cb) {
    httpTransactions.findOne({tranx_type: requestType}, function (err, resp) {
        if(err){
            cb(err,null);
        }else{
            if(resp){
                cb(null,resp);
            }else{
                cb(null,false);
            }
        }
    });
}




// HTTP CALLS FOR QA TO LIVE SERVER


var sendDataToLiveServer = function sendDataToLive(data ,url ,method, cb) {

    var options = {};
    options.body = data;
    options.json = true;
    options.url = url;
    options.method = method;
   // options.timeout = 5000;

    request(url, options, function (error, response) {

        if (error) {
           // console.log("error", error);
            cb(error,null);
        }
        else {
           // console.log('response', response);
            cb(null,response.body)
        }

    });


};

/**
 * MODULE EXPORTS
 */

module.exports.postToURL = postToURL;
module.exports.makeHttpRequest = makeHttpRequest ;
module.exports.sendDataToLiveServer = sendDataToLiveServer ;