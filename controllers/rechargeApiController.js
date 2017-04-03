/**
 * Created by harihar on 11/06/16.
 */

"use strict";

var request = require('request');
var rechargeApiConfig = require('../config/rechargeApiConfig');
var logger = require('../logger/logger.js').getLogger('rechargeApiController');
var httpCallsConfig = require('../config/httpCallsConfiguration');
var httpCallsHandler = require('../controllers/httpCallsHandler');
var rechargeApiDao =  require('../controllers/rechargeApiDao');

var baseGetURL = rechargeApiConfig.rechargeApi.baseGetURL;
var apiToken = rechargeApiConfig.rechargeApi.apiToken;

var operatorMap = {
    /*  operator_name           : operator_id  */
// prepaid
    AIRTEL                  : 1,
    VODAFONE                : 2,
    IDEA                    : 3,
    TATA_INDICOM            : 4,
    TATA_DOCOMO             : 5,
    TELENOR                 : 6,
    MTNL                    : 7,
    BSNL                    : 8,
    AIRCEL                  : 9,
    VIDEOCON                : 10,
    MTS                     : 11,
// postpaid
    AIRTEL_POSTPAID         : 23,
    IDEA_POSTPAID           : 24,
    VODAFONE_POSTPAID       : 25,
    RELIANCE_GSM_POSTPAID   : 26,
    RELIANCE_CDMA_POSTPAID  : 27,
    TATA_DOCOMO_POSTPAID    : 28,
    AIRCEL_POSTPAID         : 29,
    MTS_POSTPAID            : 30,
    RELIANCE_GSM            : 39,
    RELIANCE_CDMA           : 40,
    BSNL_POSTPAID           : 73

};

// txstatus_desc : Success / Pending / Initiated / Failure
var api_status = {
    SUCCESS   : 'Success',
    PENDING   : 'Pending',
    FAILURE   : 'Failure'
};

/**
 *
 * @param hitUrl
 * @param cb
 */
var hitRechargeApi = function(hitUrl,cb) {
    request(hitUrl, function (error, response, body) {
        if (error) {
            cb(error, {'status': response.statusCode, 'body': null});
        } else {
            cb(null, {'status': response.statusCode, 'body': JSON.parse(body)})
        }
    });
};

/**
 * return {balance} current credit balance available with the api
 */
function getApiBalance() {

    var hitUrl = baseGetURL + 'get-balance?api_token=' + apiToken;
    var balance = hitRechargeApi(hitUrl, function (error, res) {
        if (error) {
            return -1;
        } else {
            return res.body.balance;
        }
    });
}

/**
 *
 * @param phone_number
 */
function get_Operator_ID(phone_number ,cb){

    var hitUrl = baseGetURL + 'get-number?api_token='+apiToken+'&number='+ phone_number ;
    hitRechargeApi(hitUrl, function (error, res) {
        if (error) {
            cb(error,null);
        } else {
            cb(null,res.body.provider_id);
        }
    });
}

/**
 *
 * @param operator_id
 * @param phone_number
 * @param amount
 * @param order_id
 * @param player_id
 * @param cb
 */
function performRecharge(operator_id,phone_number,amount,order_id,player_id,cb) {

    var hitUrl = baseGetURL + 'paynow?api_token=' + apiToken +
        '&number=' + phone_number +
        '&provider_id=' + operator_id +
        '&amount=' + amount +
        '&client_id=' + order_id;

    //log request to db

    logRequestToDB(order_id,null, null, phone_number, player_id , operator_id, amount, 'initiated', 'About to request recharge api', function (err, logResp) {
        if (err) {
            cb(err, null);
        }else{
            hitRechargeApi(hitUrl, function (error, res) {
                if (error) {
                    cb(error, null);
                } else {
                    cb(null, res);
                }
            });
        }
    });
}

/**
 *
 * @param payId
 */
function checkTransactionStatus(payId) {
    var hitUrl = null;
    if(payId)
        hitUrl = baseGetURL + 'get-report?api_token=' + apiToken + '&payid=' + payId;
    else
        hitUrl = baseGetURL + 'get-report?api_token=' + apiToken ;

    hitRechargeApi(hitUrl, function (error, res) {
        if(error){
            logger.error(error);
        }else{
            logger.info(res);
        }
    });
}

function requestRecharge(request, cb) {

    var phone_number = request.body.number;
    var player_id = request.body.playerid;
    var amount_to_recharge = request.body.amount;
    var operator_name = request.body.operatorname.toUpperCase();
    var orderId = getUniqueOrderId();  //unique order-id || client-id

    var error = false;
    if (!phone_number || phone_number == null || phone_number == '') {
        logger.error('Mobile number is not valid');
        error = true;
    }
    else if (isNaN(amount_to_recharge) || (amount_to_recharge < 0)) {
        logger.error('Amount is not valid');
        error = true;
    } else if (player_id == null) {
        logger.error('Client id not present');
        error = true;
    }

    var responseObj = {};
    if (error === true) {
        responseObj.status = 'FAILURE';
        responseObj.status_code = rechargeApiConfig.http_status_codes.INTERNAL_SERVER_ERROR;
        responseObj.status_message = 'Mandatory recharge parameters missing.';

        logger.error('Some data missing. Not proceeding with Recharge');
        return cb(responseObj);
    } else {
        // Received valid request.Proceed with recharge...txstatus_desc
        var status;
        var operator_id = operatorMap[operator_name];

        if (!operator_id) {
            //operator id not present locally , search the api
            get_Operator_ID(phone_number, function (err, resp) {
                if (error) {
                    responseObj.status = status = 'FAILURE';
                    responseObj.status_code = rechargeApiConfig.http_status_codes.INTERNAL_SERVER_ERROR;
                    responseObj.status_message = 'Invalid mobile operator.';

                    logger.error('Invalid operator id .Not proceeding with Recharge');
                    return cb(responseObj);
                } else {
                    logger.info('Operator id was not available with server but found at recharge api.Proceeding with recharge...');

                    if (resp) {
                        operator_id = resp;
                        performRecharge(operator_id, phone_number, amount_to_recharge,orderId, player_id, function (err, res) {
                            if (err) {
                                responseObj.status = status = 'FAILED';
                                responseObj.status_code = rechargeApiConfig.http_status_codes.INTERNAL_SERVER_ERROR;
                                responseObj.status_message = 'Unable to perform recharge';
                                logger.error('Unable to perform recharge.', err);

                                logRequestToDB(orderId, null, null, phone_number, player_id, operator_id, amount_to_recharge, status, res.body.message, function (e, r) {
                                    if (e) {
                                        logger.error('Error logging failed recharge request to db', e.stack);
                                    } else {
                                        logger.info('Successfully logged failed recharge request to db');
                                    }
                                    return cb(responseObj);
                                });

                            } else {
                                console.log("RES FROM API ====> ", res);

                                if (res.body.status && res.body.status === 'failure') {
                                    responseObj.status = status = 'FAILED';
                                    responseObj.status_code = rechargeApiConfig.http_status_codes.INTERNAL_SERVER_ERROR;
                                    responseObj.status_message = 'Unable to perform recharge';
                                    logger.error('Unable to perform recharge.', err);
                                } else {

                                    var status;
                                    if (res.body.status.toUpperCase() === 'SUCCESS') {
                                        responseObj.status = res.body.txstatus_desc.toUpperCase() || 'PENDING';
                                        status = responseObj.status;
                                    }

                                    responseObj.status_code = rechargeApiConfig.http_status_codes.SUCCESS;
                                    responseObj.status_message = 'Recharge successfully initiated';
                                    logger.info('Api responded with success .Check for success / pending status');

                                }

                                logRequestToDB(orderId,res.body.payid, res.body.operator_ref, phone_number, player_id, operator_id, amount_to_recharge, status.toLowerCase(), res.body.message, function (e, r) {
                                    if (e) {
                                        logger.error('Error logging successful recharge request to db', e.stack);
                                    } else {
                                        logger.info('Successfully logged recharge request to db');
                                    }
                                    return cb(responseObj);
                                });
                            }
                        });
                    } else {
                        logger.error('Operator id not found locally and also not with recharge api');
                        responseObj.status = status = 'FAILED';
                        responseObj.status_code = rechargeApiConfig.http_status_codes.INTERNAL_SERVER_ERROR;
                        responseObj.status_message = 'Invalid mobile operator.';

                        logger.error('Invalid operator id .Not proceeding with Recharge');
                        return cb(responseObj);
                    }
                }
            });
        }
        else {
            performRecharge(operator_id, phone_number, amount_to_recharge, orderId , player_id, function (err, res) {
                if (err) {
                    responseObj.status = status = 'FAILED';
                    responseObj.status_code = rechargeApiConfig.http_status_codes.INTERNAL_SERVER_ERROR;
                    responseObj.status_message = 'Unable to perform recharge';
                    logger.error('Unable to perform recharge.', err);

                    logRequestToDB(orderId ,null, null, phone_number, player_id, operator_id, amount_to_recharge, status, res.body.message, function (e, r) {
                        if (e) {
                            logger.error('Error logging failed recharge request to db', e.stack);
                        } else {
                            logger.error('Successfully logged failed recharge request to db');
                        }
                        return cb(responseObj);
                    });

                } else {

                    if (res.body.status && res.body.status === 'failure') {
                        responseObj.status = status ='FAILED';
                        responseObj.status_code = rechargeApiConfig.http_status_codes.INTERNAL_SERVER_ERROR;
                        responseObj.status_message = 'Unable to perform recharge';
                        logger.error('Unable to perform recharge.', err);
                    } else {


                        if (res.body.status.toUpperCase() === 'SUCCESS') {
                            responseObj.status = res.body.txstatus_desc.toUpperCase() || 'PENDING';
                            status = responseObj.status;
                        }

                        responseObj.status_code = rechargeApiConfig.http_status_codes.SUCCESS;
                        responseObj.status_message = 'Recharge successfully initiated';
                        logger.info('Api responded with success .Check for success / pending status');
                    }

                    logRequestToDB(orderId ,res.body.payid, res.body.operator_ref, phone_number, player_id, operator_id, amount_to_recharge, status.toLowerCase(), res.body.message, function (e, r) {
                        if (e) {
                            logger.error('Error logging successful recharge request to db', e.stack);
                        } else {
                            logger.info('Successfully logged recharge request to db');
                        }
                        return cb(responseObj);
                    });
                }
            });
        }

    }
}

function logRequestToDB(orderId , payId, transactionId , phoneNumber , player_id , operator_id , amount , status ,message ,cb){

    var objectToBeLogged = {
        order_id        : orderId,
        pay_id          : payId,
        transaction_id  : transactionId,
        phone_number    : phoneNumber,
        player_id       : player_id,
        operator_id     : operator_id,
        amount          : amount,
        status          : status,
        status_message  : message
    };

    rechargeApiDao.saveOrUpdateTransaction(objectToBeLogged ,function(e, saved){
        if(e){
            logger.error("Error saving request to db", e.stack);
            cb(e,null);
        }
        else{
            logger.info("Recharge transaction successfully saved to db with order_id :",orderId);
            cb(null,true);
        }
    });
}

/**
 *
 * @param request - callback url set with the API
 */
var updateRechargeTransaction = function (request,response) {


    //parameters to get from the callback url : {payid,client_id,operator_ref,status}
    var payid = request.query.payid;
    var order_id = request.query.client_id;
    var transaction_id = request.query.operator_ref;
    var status = request.query.status;
    console.log("PAYID == >", payid);
    console.log("ORDERID == >", order_id);
    console.log("TRANXNID == >", transaction_id);
    console.log("STATUS == >", status);
    response.status(200).end();

    if (!payid || !order_id || !status) {
        //Received invalid parameters from the api .Reporting transaction failure
        notifySocketServerForRechargeStatus(order_id, -1, status, 500);
    } else {

        var player_id = null;
        var amount = null;
        rechargeApiDao.getPlayerIdAndAmount(order_id, function (err, resp) {
            if (err) {
                logger.error("Error getting player id and amount");
                notifySocketServerForRechargeStatus(order_id, -1, status, 500);
            } else {

                player_id = resp.player_id;
                amount = resp.amount;
                logger.info("PLAYER ID and AMOUNT == > ", player_id, "<--->", amount);

                rechargeApiDao.saveOrUpdateTransaction({
                    "pay_id": payid,
                    "order_id": order_id,
                    "status": status,
                    "transaction_id": transaction_id
                }, function (err, res) {
                    if (err) {
                        logger.error('Error updating recharge status with db ', err.stack);
                        notifySocketServerForRechargeStatus(player_id, amount, status, 500);
                    } else {
                        if (status === 'success') {
                            notifySocketServerForRechargeStatus(player_id, amount, status, 200);
                        } else if (status === 'failure') {
                            notifySocketServerForRechargeStatus(player_id, amount, status, 500);
                        }
                    }
                });
            }
        });
    }
};

var notifySocketServerForRechargeStatus = function(userid,amount,status,statusCode) {

    var dataToSend = {"requestType": httpCallsConfig.RECHARGE_STATUS,
        "payLoad": {"status_code":statusCode ,"status":status, "player_id":userid, "amount":amount }};// Recharge status updated

    httpCallsHandler.makeHttpRequest(dataToSend, 'post', function (err, response) {
        if (err) {
            logger.error('Error occurred with http call of recharge status updation ', err);
        }
        else {
            logger.info('Http post for recharge status update was successful. Response code = ', response.statusCode);
        }
    });
};

//Helper Function(s)
function getUniqueOrderId(){
    var uniqueid = new Date().getTime().toString(36);
    return uniqueid;
}


/**
 * MODULE EXPORTS
 *
 * @type {requestRecharge}
 * @type {updateRechargeTransaction}
 *
 */

module.exports.requestRecharge = requestRecharge;
module.exports.updateRechargeTransaction = updateRechargeTransaction;
module.exports.notifySocketServerForRechargeStatus = notifySocketServerForRechargeStatus;