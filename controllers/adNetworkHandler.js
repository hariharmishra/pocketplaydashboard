
/**
 * Created by harihar on 29/03/16.
 */


var adNetwork = require('../database/models/adNetwork.js');
var logger = require('../logger/logger.js').getLogger('adNetworkHandler');
var formidable = require('formidable');
var path = require('path');


function saveAd(request , cb) {


    processIncomingFormData(request,function(err,formData) {

        adNetwork.findOne({ad_networks_for_OS :formData.os_type},function (err, queryResult) {

            if (err)
                cb(err, null);
            else {

                if (queryResult == null) {

                    var ad_data = compileDataForDB(formData, queryResult);
                    //console.log("\nCompiled ad data to be saved  : ", ad_data);
                    ad_data.save(function (err, queryResult) {
                        if (err)
                            cb(err, null);
                        else {
                            logger.info("Ad configuration successfully saved !!!");
                            cb(null, {'os_type': ad_data.ad_networks_for_OS});
                        }
                    });
                }
                else {

                    var ad_data = compileDataForDB(formData, queryResult);
                   // console.log("\nCompiled ad data to be updated  : ", ad_data);
                    adNetwork.update({_id: queryResult._id}, ad_data, function (err, queryResult) {
                        if (err)
                            cb(err, null);
                        else {
                            logger.info("Ads configuration successfully Updated !!!");
                            cb(null, {'os_type': ad_data.ad_networks_for_OS});
                        }
                    });

                }
            }
        });
    });




}

module.exports.saveAd = saveAd;


function  processIncomingFormData(request,cb) {

    var form = new formidable.IncomingForm();
    var fields = {};

    form.on('aborted', function (err) {
        logger.error("Form submission ABORTED by user");
        cb(err,null);
    });

    form.on('error', function (err) {
        logger.error("Error occurred while processing incoming ads form ...", err);
        cb(err,null);

    });

    form.on('field', function (field, value) {
        //console.log(field, value);
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
        //console.log('\nfields == >\n ', fields);
        cb(null,fields);

    });

    form.parse(request);

}


function compileDataForDB(formData , savedAdData) {

    // If saved data exists for adNetwork , compile data object according to updates received else create new data object

    var adObjectsArray = [];
    var adData;

    if (savedAdData) {
        adData = new adNetwork(savedAdData.toJSON());

    } else {
        adData = new adNetwork();
    }


    if (formData.os_type)
        adData.ad_networks_for_OS = formData.os_type;

    if (formData.interstitial_time_interval)
       adData.interstitial_time_interval = formData.interstitial_time_interval;

    if (formData.rewarded_video_coins)
        adData.rewarded_video_coins = formData.rewarded_video_coins;

    if (formData.videoAd_time_interval)
        adData.videoAd_time_interval = formData.videoAd_time_interval;

    if (formData.minimum_bootup_for_ads)
        adData.minimum_bootup_for_ads = formData.minimum_bootup_for_ads;

    var ad_show_locations_interstitial ={};
    ad_show_locations_interstitial.on_bootup = formData.show_interstitialAd_on_bootup || false;
    ad_show_locations_interstitial.on_game_finished = formData.show_interstitialAd_on_game_finished || false;
    ad_show_locations_interstitial.on_back_from_game = formData.show_interstitialAd_on_back_from_game || false;
    ad_show_locations_interstitial.on_back_from_user_profile = formData.show_interstitialAd_on_back_from_user_profile || false;
    ad_show_locations_interstitial.on_app_exit = formData.show_interstitialAd_on_app_exit || false;

    adData.ad_show_locations_interstitial = ad_show_locations_interstitial;

    var ad_show_locations_banner ={};
    ad_show_locations_banner.on_matches = formData.show_bannerAd_on_matches || false;
    ad_show_locations_banner.on_games = formData.show_bannerAd_on_games || false;
    ad_show_locations_banner.on_chat = formData.show_bannerAd_on_chat || false;
    ad_show_locations_banner.on_profile = formData.show_bannerAd_on_profile || false;
    ad_show_locations_banner.in_game = formData.show_bannerAd_on_ingame || false;

    adData.ad_show_locations_banner = ad_show_locations_banner;

    if (formData.admob_interstitial) {
        var adObject = {};
        adObject.ad_network_name = 'admob';
        adObject.ad_network_type = 'interstitial';
        if (formData.admob_interstitial_priority)
            adObject.ad_network_priority = formData.admob_interstitial_priority;
        if (formData.admob_interstitial_key) {
            var keys = {};
            keys.app_key = formData.admob_interstitial_key;
            adObject.ad_network_keys = keys;
        }

        adObject.is_enabled = formData.is_admob_interstitial_enabled || false;
        adObjectsArray.push(adObject);
    }

    if (formData.admob_banner) {
        var adObject = {};
        adObject.ad_network_name = 'admob';
        adObject.ad_network_type = 'banner';
        if (formData.admob_banner_priority)
            adObject.ad_network_priority = formData.admob_banner_priority;
        if (formData.admob_banner_key) {
            var keys = {};
            keys.app_key = formData.admob_banner_key;
            adObject.ad_network_keys = keys;
        }

        adObject.is_enabled = formData.is_admob_banner_enabled || false;
        adObjectsArray.push(adObject);
    }

    if (formData.chartboost_interstitial) {
        var adObject = {};
        adObject.ad_network_name = 'chartboost';
        adObject.ad_network_type = 'interstitial';
        if (formData.chartboost_interstitial_priority)
            adObject.ad_network_priority = formData.chartboost_interstitial_priority;
        var keys = {};
        if (formData.chartboost_interstitial_secret_key) {
            keys.secret_key = formData.chartboost_interstitial_secret_key;
        }
        if (formData.chartboost_interstitial_app_key) {
            keys.app_key = formData.chartboost_interstitial_app_key;
        }
        adObject.ad_network_keys = keys;

        adObject.is_enabled = formData.is_chartboost_interstitial_enabled || false;
        adObjectsArray.push(adObject);
    }

    if (formData.chartboost_video) {
        var adObject = {};
        adObject.ad_network_name = 'chartboost';
        adObject.ad_network_type = 'video';
        if (formData.chartboost_video_priority)
            adObject.ad_network_priority = formData.chartboost_video_priority;
        var keys = {};
        if (formData.chartboost_video_secret_key) {
            keys.secret_key = formData.chartboost_video_secret_key;
        }
        if (formData.chartboost_video_app_key) {
            keys.app_key = formData.chartboost_video_app_key;
        }
        adObject.ad_network_keys = keys;

        adObject.is_enabled = formData.is_chartboost_video_enabled || false;
        adObjectsArray.push(adObject);
    }

    if(formData.unityAds_interstitial){
        var adObject = {};
        adObject.ad_network_name = 'unityAds';
        adObject.ad_network_type = 'interstitial';
        if (formData.unityAds_interstitial_priority)
            adObject.ad_network_priority = formData.unityAds_interstitial_priority;
        var keys = {};
        if (formData.unityAds_interstitial_integrationid) {
            keys.secret_key = formData.unityAds_interstitial_integrationid;
        }
        if (formData.unityAds_interstitial_gameid) {
            keys.app_key = formData.unityAds_interstitial_gameid;
        }
        adObject.ad_network_keys = keys;

        adObject.is_enabled = formData.is_unityAds_interstitial_enabled || false;
        adObjectsArray.push(adObject);
    }

    if(formData.unityAds_video){
        var adObject = {};
        adObject.ad_network_name = 'unityAds';
        adObject.ad_network_type = 'video';
        if (formData.unityAds_video_priority)
            adObject.ad_network_priority = formData.unityAds_video_priority;
        var keys = {};
        if (formData.unityAds_video_integrationid) {
            keys.secret_key = formData.unityAds_video_integrationid;
        }
        if (formData.unityAds_video_gameid) {
            keys.app_key = formData.unityAds_video_gameid;
        }
        adObject.ad_network_keys = keys;

        adObject.is_enabled = formData.is_unityAds_video_enabled || false;
        adObjectsArray.push(adObject);
    }

    adData.ad_networks = adObjectsArray;

    return adData;

}


function getAdData(os_type , cb) {
    console.log("About to fetch Addata for os : ",os_type);

    adNetwork.findOne({ad_networks_for_OS:os_type},function (err, queryResult) {
        if (err)
            cb(err, null);
        else {
           // console.log("adData found !!!", queryResult);

            var res = compileQueryOutput(queryResult);
          //  console.log("RESPONSE --- > ", {"addata": res});
            cb(null, {"addata": res});

        }
    });
}

module.exports.getAdData = getAdData;


function compileQueryOutput(queryResult){

    var data = {};


    if(queryResult != null) {

        data.interstitial_time_interval = queryResult.interstitial_time_interval;
        data.videoAd_time_interval = queryResult.videoAd_time_interval;
        data.rewarded_video_coins = queryResult.rewarded_video_coins ;
        data.minimum_bootup_for_ads = queryResult.minimum_bootup_for_ads;

        data.show_interstitialAd_on_bootup = queryResult.ad_show_locations_interstitial.on_bootup;
        data.show_interstitialAd_on_game_finished = queryResult.ad_show_locations_interstitial.on_game_finished;
        data.show_interstitialAd_on_back_from_game = queryResult.ad_show_locations_interstitial.on_back_from_game;
        data.show_interstitialAd_on_back_from_user_profile = queryResult.ad_show_locations_interstitial.on_back_from_user_profile;
        data.show_interstitialAd_on_app_exit = queryResult.ad_show_locations_interstitial.on_app_exit;

        data.ad_networks_for_OS = queryResult.ad_networks_for_OS;

        data.show_bannerAd_on_games = queryResult.ad_show_locations_banner.on_matches;
        data.show_bannerAd_on_matches = queryResult.ad_show_locations_banner.on_games;
        data.show_bannerAd_on_chat = queryResult.ad_show_locations_banner.on_chat;
        data.show_bannerAd_on_profile = queryResult.ad_show_locations_banner.on_profile;
        data.show_bannerAd_on_ingame = queryResult.ad_show_locations_banner.in_game;


        for(var j= 0;j< queryResult.ad_networks.length;j++){
            if(queryResult.ad_networks[j].ad_network_name =='admob'){
                if(queryResult.ad_networks[j].ad_network_type == 'banner'){
                    var adMobBannerObj = {};

                    adMobBannerObj.enable = queryResult.ad_networks[j].is_enabled;
                    adMobBannerObj.ad_network_priority = queryResult.ad_networks[j].ad_network_priority || null;
                    if(queryResult.ad_networks[j].ad_network_keys)
                        adMobBannerObj.app_key = queryResult.ad_networks[j].ad_network_keys.app_key;
                    data.adMobBannerObj = adMobBannerObj;

                }else if(queryResult.ad_networks[j].ad_network_type == 'interstitial'){
                    var adMobInterstitialObj = {};

                    adMobInterstitialObj.enable = queryResult.ad_networks[j].is_enabled;
                    adMobInterstitialObj.ad_network_priority = queryResult.ad_networks[j].ad_network_priority || null;
                    if(queryResult.ad_networks[j].ad_network_keys)
                        adMobInterstitialObj.app_key = queryResult.ad_networks[j].ad_network_keys.app_key;
                    data.adMobInterstitialObj = adMobInterstitialObj;
                }
            }
            else if(queryResult.ad_networks[j].ad_network_name =='chartboost') {
                if (queryResult.ad_networks[j].ad_network_type == 'interstitial') {
                    var chartBoostInterstitialObj = {};

                    chartBoostInterstitialObj.enable = queryResult.ad_networks[j].is_enabled;
                    chartBoostInterstitialObj.ad_network_priority = queryResult.ad_networks[j].ad_network_priority || null;
                    if (queryResult.ad_networks[j].ad_network_keys) {
                        chartBoostInterstitialObj.app_key = queryResult.ad_networks[j].ad_network_keys.app_key;
                        chartBoostInterstitialObj.secret_key = queryResult.ad_networks[j].ad_network_keys.secret_key;
                    }
                    data.chartBoostInterstitialObj = chartBoostInterstitialObj;
                } else if (queryResult.ad_networks[j].ad_network_type == 'video') {
                    var chartBoostVideoObj = {};

                    chartBoostVideoObj.enable = queryResult.ad_networks[j].is_enabled;
                    chartBoostVideoObj.ad_network_priority = queryResult.ad_networks[j].ad_network_priority || null;
                    if (queryResult.ad_networks[j].ad_network_keys) {
                        chartBoostVideoObj.app_key = queryResult.ad_networks[j].ad_network_keys.app_key;
                        chartBoostVideoObj.secret_key = queryResult.ad_networks[j].ad_network_keys.secret_key;
                    }
                    data.chartBoostVideoObj = chartBoostVideoObj;

                }
            }
            else if(queryResult.ad_networks[j].ad_network_name =='unityAds') {
                if(queryResult.ad_networks[j].ad_network_type == 'video'){
                    var unityAdsVideoObj = {};

                    unityAdsVideoObj.enable = queryResult.ad_networks[j].is_enabled;
                    unityAdsVideoObj.ad_network_priority = queryResult.ad_networks[j].ad_network_priority || null;
                    if (queryResult.ad_networks[j].ad_network_keys) {
                        unityAdsVideoObj.app_key = queryResult.ad_networks[j].ad_network_keys.app_key;
                        unityAdsVideoObj.secret_key = queryResult.ad_networks[j].ad_network_keys.secret_key;
                    }
                    data.unityAdsVideoObj = unityAdsVideoObj;
                }else  if(queryResult.ad_networks[j].ad_network_type == 'interstitial'){
                    var unityAdsInterstitialObj = {};

                    unityAdsInterstitialObj.enable = queryResult.ad_networks[j].is_enabled;
                    unityAdsInterstitialObj.ad_network_priority = queryResult.ad_networks[j].ad_network_priority || null;
                    if (queryResult.ad_networks[j].ad_network_keys) {
                        unityAdsInterstitialObj.app_key = queryResult.ad_networks[j].ad_network_keys.app_key;
                        unityAdsInterstitialObj.secret_key = queryResult.ad_networks[j].ad_network_keys.secret_key;
                    }
                    data.unityAdsInterstitialObj = unityAdsInterstitialObj;
                }

            }
        }


        return data;
    }


}

