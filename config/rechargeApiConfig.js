/**
 * Created by harihar on 08/06/16.
 */

"use strict";

const recharge_api_status_codes = {
    none        : -1,
    initiated   :  0,
    success     :  1,
    pending     :  2,
    failure     :  3
};
exports.recharge_api_status_codes = recharge_api_status_codes;

const http_status_codes ={
    SUCCESS : 200,
    BAD_REQUEST : 400,
    REQUEST_TIMEOUT : 408,
    INTERNAL_SERVER_ERROR : 500,
    DATABASE_ERROR : 600
};
exports.http_status_codes = http_status_codes;

exports.rechargeApi = {
    name : 'Pay2All',
    apiToken : 'BQPPtiJFNfiNRZL6SfxIUCMLIC9DS6KRDhtmvOqfcAqLms5Yhg1kZp4fbaSW',
    statusCodes : recharge_api_status_codes,
    baseGetURL : 'https://www.pay2all.in/web-api/'
};


