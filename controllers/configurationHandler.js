/**
 * Created by harihar on 29/03/16.
 */


var configuration = require('../database/models/configuration.js');
var httpCallsHandler = require('../controllers/httpCallsHandler');
var httpCallsConfig = require('../config/httpCallsConfiguration.js');
var formidable = require('formidable');
var logger = require('../logger/logger.js').getLogger('configurationHandler');
var path = require('path');


function saveConfiguration(request , cb) {
    processIncomingFormData(request, function (err, formData) {


        if (err) {
            logger.error('Error processing configuration form data\n', err);
        }
        else {

            var config = new configuration();

            config.registered_user_default_coins = formData.default_coins_user;
            config.guest_user_default_coins = formData.default_coins_guest;
            config.referral_bonus = formData.referral_bonus;
            config.fb_like_bonus = formData.fb_like_bonus;
            config.default_login = formData.default_login;
            config.rewarded_video_coins = formData.rewarded_video_coins;
            config.updated_at = new Date();
            config.paytm.guest_user_balance = formData.paytm_balance_guest;
            config.paytm.registered_user_balance = formData.paytm_balance_register;
            config.paytm.referral_bonus = formData.paytm_referral;
            config.paytm.min_recharge_bal = formData.min_recharge_bal;
            config.paytm.country_list = ['IN'];
            config.version = '0.0';



            configuration.findOne(function (err, queryResult) {

                if (err)
                    cb(err, null);
                else {

                    if (queryResult == null) {
                        config.save(function (err, queryResult) {
                            if (err)
                                cb(err, null);
                            else {
                                logger.info("Configuration successfully saved to database. ");
                                notifyConfigModification();
                                cb(null, queryResult);
                            }
                        });
                    }
                    else {
                        // Configuration exists. update it !
                        var updatedObj = {};
                        var paytm ={};

                        if(formData.default_coins_user != '' || formData.default_coins_user != undefined){
                            updatedObj.registered_user_default_coins = formData.default_coins_user;
                        }
                        if(formData.default_coins_guest != '' || formData.default_coins_guest != undefined){
                            updatedObj.guest_user_default_coins = formData.default_coins_guest;
                        }
                        if(formData.referral_bonus != '' || formData.referral_bonus != undefined){
                            updatedObj.referral_bonus = formData.referral_bonus;
                        }
                        if(formData.fb_like_bonus != '' || formData.fb_like_bonus != undefined){
                            updatedObj.fb_like_bonus = formData.fb_like_bonus;
                        }
                        if(formData.default_login != '' || formData.default_login != undefined){
                            updatedObj.default_login = formData.default_login;
                        }
                        if(formData.rewarded_video_coins != '' || formData.rewarded_video_coins != undefined){
                            updatedObj.rewarded_video_coins = formData.rewarded_video_coins;
                        }
                        if(formData.paytm_balance_register != '' || formData.paytm_balance_register != undefined){
                            paytm.registered_user_balance = formData.paytm_balance_register;
                        }
                        if(formData.paytm_balance_guest != '' || formData.paytm_balance_guest != undefined){
                            paytm.guest_user_balance = formData.paytm_balance_guest;
                        }
                        if(formData.paytm_referral != '' || formData.paytm_referral != undefined){
                            paytm.referral_bonus = formData.paytm_referral;
                        }
                        if(formData.min_recharge_bal != '' || formData.min_recharge_bal != undefined){
                            paytm.min_recharge_bal = formData.min_recharge_bal;
                        }
                        //if(formData.country_list != null || formData.country_list != undefined){
                        //    paytm.country_list = formData.country_list;
                        //}
                        var lastConfigVersion = queryResult.version;
                        updatedObj.version  = (parseFloat(lastConfigVersion) + 1.0).toFixed(1);

                        updatedObj.updated_at = new Date();
                        updatedObj.paytm = paytm;

                        configuration.update({_id:queryResult._id},updatedObj,function (err, queryResult) {
                            if (err)
                                cb(err, null);
                            else {
                                logger.info("Configuration Updated !!!");
                                notifyConfigModification();
                                cb(null, queryResult);
                            }
                        });


                    }
                }
            });
        }
    });
}

module.exports.saveConfiguration = saveConfiguration;


function  processIncomingFormData(request,cb) {

    var form = new formidable.IncomingForm();
    var fields = {};

    form.on('aborted', function (err) {
        logger.error("Config Form submission ABORTED by user");
    });

    form.on('error', function (err) {
        logger.error("Error parsing configuration form received", err);
        cb(err,null);

    });

    form.on('field', function (field, value) {
        // console.log(field, value);
        if (field != 'submit') {

            if (!fields[field])
                fields[field] = value;
            else {
                if (fields[field].constructor.toString().indexOf("Array") > -1) { // is array
                    fields[field].push(value);
                } else { // not array
                    var tmp = fields[field];
                    fields[field] = [];
                    fields[field].push(tmp);
                    fields[field].push(value);
                }
            }
        }
    });


    form.on('end', function () {
        //console.log("********* c");
       // console.log('\nfields == >\n ', fields);
        cb(null, fields);

    });

    form.parse(request);
}


function getConfiguration(cb) {

    configuration.findOne(function (err, queryResult) {
        if (err)
            cb(err, null);
        else {
            var res = compileQueryOutput(queryResult);
            logger.info("Configuration Details found .Response code: 200");
            cb(null, {"configuration": res});

        }
    });
}

module.exports.getConfiguration = getConfiguration;


function compileQueryOutput(queryResult){

    var configuration = {};
    var paytm = {};

    if(queryResult != null) {
        configuration.registered_user_default_coins = typeof (queryResult.registered_user_default_coins) == 'undefined' || queryResult.registered_user_default_coins == '' ? 'null' : queryResult.registered_user_default_coins;
        configuration.guest_user_default_coins = typeof (queryResult.guest_user_default_coins) == 'undefined' || queryResult.guest_user_default_coins == '' ? 'null' : queryResult.guest_user_default_coins;
        configuration.fb_like_bonus = typeof (queryResult.fb_like_bonus) == 'undefined' || queryResult.fb_like_bonus == '' ? 'null' : queryResult.fb_like_bonus;
        configuration.referral_bonus = typeof (queryResult.referral_bonus) == 'undefined' || queryResult.referral_bonus == '' ? 'null' : queryResult.referral_bonus;
        configuration.rewarded_video_coins = typeof (queryResult.rewarded_video_coins) == 'undefined' || queryResult.rewarded_video_coins == '' ? 'null' : queryResult.rewarded_video_coins;
        paytm.country_list = typeof (queryResult.paytm.country_list) == 'undefined' || queryResult.paytm.country_list == '' ? 'null' : queryResult.paytm.country_list;
        paytm.guest_user_balance = typeof (queryResult.paytm.guest_user_balance) == 'undefined' || queryResult.paytm.guest_user_balance == '' ? 'null' : queryResult.paytm.guest_user_balance;
        paytm.registered_user_balance = typeof (queryResult.paytm.registered_user_balance) == 'undefined' || queryResult.paytm.registered_user_balance == '' ? 'null' : queryResult.paytm.registered_user_balance;
        paytm.referral_bonus = typeof (queryResult.paytm.referral_bonus) == 'undefined' || queryResult.paytm.referral_bonus == '' ? 'null' : queryResult.paytm.referral_bonus;
        paytm.min_recharge_bal = typeof (queryResult.paytm.min_recharge_bal) == 'undefined' || queryResult.paytm.min_recharge_bal == '' ? 'null' : queryResult.paytm.min_recharge_bal;
        configuration.default_login = typeof (queryResult.default_login) == 'undefined' || queryResult.default_login == '' ? 'null' : queryResult.default_login;
        configuration.paytm = paytm;
        configuration.version = typeof (queryResult.version) == 'undefined' || queryResult.version == '' ? 'null' : queryResult.version;

        return configuration;
    }
    else
    {
        configuration.registered_user_default_coins = 'null' ;
        configuration.guest_user_default_coins = 'null';
        configuration.fb_like_bonus = 'null';
        configuration.referral_bonus = 'null';
        configuration.rewarded_video_coins ='null';
        paytm.country_list = 'null';
        paytm.guest_user_balance ='null';
        paytm.registered_user_balance = 'null';
        paytm.referral_bonus = 'null';
        paytm.min_recharge_bal = 'null';
        configuration.default_login = 'null';
        configuration.version = '0.0';
        configuration.paytm = paytm;
        return configuration;
    }

}


function notifyConfigModification(){
    var dataToSend = {"requestType": httpCallsConfig.CONFIGURATION_VERSION_UPDATED};    // configuration version updated
    httpCallsHandler.makeHttpRequest(dataToSend, 'post', function (err, response) {
        if (err) {
            logger.error('Error occurred with http call of version updated ', err);
            //cb(err,null)
        }
        else {
            logger.info('Http post for configuration version update was successful. Response code = ', response.statusCode);
            //cb(null,response.statusCode);
        }
    });

}