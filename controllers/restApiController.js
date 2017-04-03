/**
 * Created by harihar on 02/06/16.
 */


//************************* Class Imports *******************************************************************/

var restApiDao = require('../controllers/restApiDao');
var UAParser = require('ua-parser-js');
var logger = require('../logger/logger').getLogger('restApiController');





//************************* Ads DBHandler *******************************************************************/

/**
 * Get ads data depending on requested osType
 * @param request
 * @param response
 */
var getAdsData = function getAdsData(request,response) {

    var requestTime = new Date().getTime();

    var osType = request.body.ostype;
    logger.info('Ads data requested for os: ',osType);

    restApiDao.getAdsData(osType ,function(err, adData) {
        if (err) {
            logger.error("Error fetching ads data : ", err);
            response.send({'status': 500, 'message': "Internal server error.\n"});
            response.end();
        }
        else {
            if (adData == null) {

                response.send({
                    'status': 404,
                    'message': 'No ads data found',
                    'data': adData
                });
                response.end();
            }
            else {

               // console.log(adData);
                var compiledAdsData = compileAdsDataResponse(adData);
                response.send({'status': 200, 'message': 'successfull', 'data': compiledAdsData});
                response.end();
            }

        }

        var responseTime = new Date().getTime() - requestTime;
        logger.info("RESPONSE TIME FOR REQUEST /getAdsData : ", responseTime, " ms.");

    });
};

/**
 * Compile response for ad data
 *
 * @param adData
 * @returns {adDataResponse} ad data response
 */
function compileAdsDataResponse(adData) {
    var compiledResponse = {};
    var bannerAds = [];
    var interstitialAds = [];
    var rewardedVideoAds = [];

    compiledResponse.timeInterval = adData.interstitial_time_interval;
    compiledResponse.rewarded_video_coins = adData.rewarded_video_coins;
    compiledResponse.videoAd_time_interval = adData.videoAd_time_interval;
    compiledResponse.minimum_bootup_for_ads = adData.minimum_bootup_for_ads;

    var adLocationInterstitial = {};
    adLocationInterstitial.onBootup = adData.ad_show_locations_interstitial.on_back_from_game;
    adLocationInterstitial.onGameFinished = adData.ad_show_locations_interstitial.on_game_finished;
    adLocationInterstitial.onBackFromGame = adData.ad_show_locations_interstitial.on_back_from_game;
    adLocationInterstitial.onBackFromUserProfile = adData.ad_show_locations_interstitial.on_back_from_user_profile;
    adLocationInterstitial.onAppExit = adData.ad_show_locations_interstitial.on_app_exit;
    compiledResponse.adLocationInterstitial = adLocationInterstitial;

    var adLocationBanner = {};
    adLocationBanner.onMatches = adData.ad_show_locations_banner.on_matches;
    adLocationBanner.onGames = adData.ad_show_locations_banner.on_games;
    adLocationBanner.onChat = adData.ad_show_locations_banner.on_chat;
    adLocationBanner.onProfile = adData.ad_show_locations_banner.on_profile;
    adLocationBanner.InGame = adData.ad_show_locations_banner.in_game;
    compiledResponse.adLocationBanner = adLocationBanner;

    for (var j = 0; j < adData.ad_networks.length; j++) {
        if (adData.ad_networks[j].ad_network_name === 'admob') {
            if (adData.ad_networks[j].ad_network_type === 'banner') {
                var adMobBannerObj = {};
                adMobBannerObj.adsProvider = 1;             // 1 is for admob
                adMobBannerObj.enable = adData.ad_networks[j].is_enabled;
               // adMobBannerObj.priority = adData.ad_networks[j].ad_network_priority || null;
                if (adData.ad_networks[j].ad_network_keys)
                    adMobBannerObj.adkey = adData.ad_networks[j].ad_network_keys.app_key;
                bannerAds.push(adMobBannerObj);


            } else if (adData.ad_networks[j].ad_network_type == 'interstitial') {
                var adMobInterstitialObj = {};
                adMobInterstitialObj.adsProvider = 1;     // 1 is for admob
                adMobInterstitialObj.enable = adData.ad_networks[j].is_enabled;
                adMobInterstitialObj.priority = adData.ad_networks[j].ad_network_priority || 0;
                if (adData.ad_networks[j].ad_network_keys)
                    adMobInterstitialObj.adkey = adData.ad_networks[j].ad_network_keys.app_key;
                interstitialAds.push(adMobInterstitialObj);
            }
        }
        else if (adData.ad_networks[j].ad_network_name == 'chartboost') {

            if (adData.ad_networks[j].ad_network_type === 'interstitial') {
                var chartBoostInterstitialObj = {};
                chartBoostInterstitialObj.adsProvider = 2;  //2 is for chartboost
                chartBoostInterstitialObj.enable = adData.ad_networks[j].is_enabled;
                chartBoostInterstitialObj.priority = adData.ad_networks[j].ad_network_priority || 0;
                if (adData.ad_networks[j].ad_network_keys) {
                    chartBoostInterstitialObj.appId = adData.ad_networks[j].ad_network_keys.app_key;
                    chartBoostInterstitialObj.appSignature = adData.ad_networks[j].ad_network_keys.secret_key;
                }
                interstitialAds.push(chartBoostInterstitialObj);
            } else if (adData.ad_networks[j].ad_network_type === 'video') {
                var chartBoostVideoObj = {};
                chartBoostVideoObj.adsProvider = 2;  //2 is for chartboost
                chartBoostVideoObj.enable = adData.ad_networks[j].is_enabled;
                chartBoostVideoObj.priority = adData.ad_networks[j].ad_network_priority || 0;
                if (adData.ad_networks[j].ad_network_keys) {
                    chartBoostVideoObj.appId = adData.ad_networks[j].ad_network_keys.app_key;
                    chartBoostVideoObj.appSignature = adData.ad_networks[j].ad_network_keys.secret_key;
                }
                rewardedVideoAds.push(chartBoostVideoObj);
            }
        }
        else if (adData.ad_networks[j].ad_network_name == 'unityAds') {
            if (adData.ad_networks[j].ad_network_type === 'interstitial') {
                var unityAdsInterstitialObj = {};
                unityAdsInterstitialObj.adsProvider = 3;  //3 is for unityAds
                unityAdsInterstitialObj.enable = adData.ad_networks[j].is_enabled;
                unityAdsInterstitialObj.priority = adData.ad_networks[j].ad_network_priority || 0;
                if (adData.ad_networks[j].ad_network_keys) {
                    unityAdsInterstitialObj.gameId = adData.ad_networks[j].ad_network_keys.app_key;
                    unityAdsInterstitialObj.integrationId = adData.ad_networks[j].ad_network_keys.secret_key;
                }
                interstitialAds.push(unityAdsInterstitialObj);
            } else if (adData.ad_networks[j].ad_network_type === 'video')
            {
                var unityAdsVideoObj = {};
                unityAdsVideoObj.adsProvider = 3 ;  //3 is for unityAds
                unityAdsVideoObj.enable = adData.ad_networks[j].is_enabled;
                unityAdsVideoObj.priority = adData.ad_networks[j].ad_network_priority || 0;
                if (adData.ad_networks[j].ad_network_keys) {
                    unityAdsVideoObj.gameId = adData.ad_networks[j].ad_network_keys.app_key;
                    unityAdsVideoObj.integrationId = adData.ad_networks[j].ad_network_keys.secret_key;
                }
                rewardedVideoAds.push(unityAdsVideoObj);
            }
        }
    }

    compiledResponse.bannerAds = bannerAds;
    compiledResponse.interstitialAds = interstitialAds;
    compiledResponse.rewardedVideoAds = rewardedVideoAds;

    return compiledResponse;
}




//************************* Privacy Settings DBHandler ******************************************************/

/**
 *  Get privacy settings for requested user
 * @param request
 * @param response
 */
function fetchUserPrivacySettings(request,response) {

    var requestTime = new Date().getTime();
    var userId = request.body.userid;

    if ((userId === undefined || userId == null) ) {
        logger.info("Invalid userid received :",userId);
        response.send({
            'status': 403,
            'message': 'Invalid data received',
            'data': null
        });
        response.end();
    }
    else {
        restApiDao.fetchUserPrivacySettings(userId,  function (err, queryResult) {
            if (err) {
                logger.error("Error fetching privacy setting for user.Reason : ", err);
                response.send({'status': 500, 'message': "Internal server error."});
                response.end();
            }
            else {
                logger.info("Privacy settings successfully sent.");
                if (queryResult == null) {

                    response.send({
                        'status': 404,
                        'message': 'Privacy settings for user is not found',
                        'data': queryResult
                    });
                    response.end();
                }
                else {
                    var privacyResponse = userPrivacyResponse(queryResult);
                    response.send({'status': 200, 'message': 'successfull', 'data': privacyResponse});
                    response.end();
                }

            }

            var responseTime = new Date().getTime() - requestTime ;
            logger.info("RESPONSE TIME FOR REQUEST /fetchUserPrivacySettings : ",responseTime, " ms.");

        });

    }
}

/**
 *  Compile response for User privacy settings
 *
 * @param result
 * @returns {{PrivacyPolicy: {}}}
 */
function userPrivacyResponse(result){
    var privacy_policy={};
    var message_permission
        ,friend_visibility
        ,friend_request ;

    if(result && result._id) {
        friend_visibility = result.privacy_policy.friend_visibility;
        message_permission =  result.privacy_policy.message_permission;
        friend_request =  result.privacy_policy.friend_request;
    }

    privacy_policy.FriendVisibility  = friend_visibility || 0;
    privacy_policy.MessagePermission  = message_permission || 0;
    privacy_policy.FriendRequest  = friend_request || 0;

    return {"PrivacyPolicy": privacy_policy};

}




//************************* Random Pocketplay user(s) search DBHandler **************************************/

/**
 * Get random users on pocket play those who aren't friends of user
 * @param request
 * @param response
 */
function fetchRandomFriendsInfo(request,response) {

    var requestTime = new Date().getTime();

    var userId = request.body.userid;
    var searchText = request.body.searchText;
    var timeStamp = request.body.timeStamp;

    logger.info('UserId ',userId,' requested with searchText : ',searchText );

    if ((userId === undefined || userId == null) || (searchText === undefined || searchText == null || searchText=='') ) {
        logger.error('Invalid userid or search text.');
        response.send({
            'status': 403,
            'message': 'Invalid data received',
            'data': null
        });
        response.end();
    }
    else {

        restApiDao.fetchRandomFriendsInfo(userId, searchText,timeStamp, function (err, queryResult) {

            if (err) {
                logger.error("Error fetching random users of pocketplay : ", err);
                response.send({'status': 500, 'message': "Internal server error."});
                response.end();
            }
            else {
                if (queryResult == null) {

                    response.send({
                        'status': 404,
                        'message': 'User requested for is not found',
                        'data': queryResult
                    });
                    response.end();
                }
                else {
                    response.send({'status': 200, 'message': 'successfull', 'data': queryResult});
                    response.end();
                }
            }

            var responseTime = new Date().getTime() - requestTime ;
            logger.info("RESPONSE TIME FOR REQUEST /fetchRandomFriendsInfo : ",responseTime, " ms.");
        });

    }
}




//************************* User's info bundled with pocketplay friends/buddies DBHandler *******************/

/**
 *  Get the list of pocketplay users who are either buddies/friends
 * @param request
 * @param response
 */
function fetchUserInfo(request,response) {

    var requestTime = new Date().getTime();
    var userId1 = request.body.userid1;
    var userId2 = request.body.userid2;


    if (!userId1 ||!userId2) {
        logger.error("Invalid user-id(s) received. Response code : 403");
        response.send({
            'status': 403,
            'message': 'Invalid data received',
            'data': null
        });
        response.end();
    }
    else {

        restApiDao.fetchUserInfo(userId1, userId2, function (err, queryResult) {
            if (err) {
                console.error("Error fetching user-info from db : ", err);
                response.send({'status': 500, 'message': "Internal server error."});
                response.end();
            }
            else {
                if (!queryResult) {
                    logger.info("Requested user : %s not found ",userId2);
                    response.send({
                        'status': 404,
                        'message': 'Requested user not found',
                        'data': queryResult
                    });
                    response.end();
                }
                else {
                    var res = compileUserInfoResponse(queryResult,userId1,userId2);
                    response.send({'status': 200, 'message': 'successfull', 'data': res});
                    response.end();
                    logger.info("Response successfully sent for player-name = %s ",res.PlayerName);
                }
            }
            var responseTime = new Date().getTime() - requestTime ;
            logger.info("RESPONSE TIME FOR REQUEST /fetchUserInfo : ",responseTime, " ms.");
        });
    }
}

function compileUserInfoResponse(userResult,requestedBy) {
    var userData = {};
    var gamesPlayed = [];

    userData.PlayerName = userResult.display_name;
    userData.PlayerImageUrl = userResult.profile_pic_1;
    userData.PlayerImageUrl2 = userResult.profile_pic_2;
    userData.UserId = userResult._id;
    userData.Status = userResult.profile_status;
    userData.PlayersCoin = userResult.balance.toString();
    userData.Level = userResult.level.toString();
    userData.PlayerCountryId = userResult.country_id;
    userData.ProfileViews = userResult.profile_views.toString();
    userData.MatchesPlayed = userResult.matches_plays.toString();
    userData.MatchesWon = userResult.matches_won.toString();
    userData.CoinsWon = userResult.coins_won.toString();


    for (var index in userResult.games) {
        var gameObj = {};
        gameObj.GameId = userResult.games[index].game_id;
        gameObj.FriendlyWinCount = userResult.games[index].friendly_win_count;
        gameObj.FriendlyPlaysCount = userResult.games[index].friendly_plays_count;
        gameObj.FriendlyCoinsWon = userResult.games[index].friendly_coins_won.toString();
        gameObj.FriendlyLossCount = userResult.games[index].friendly_loss_count;
        gameObj.RandomWinCount = userResult.games[index].random_win_count;
        gameObj.RandomPlaysCount = userResult.games[index].random_plays_count;
        gameObj.RandomCoinsWon = userResult.games[index].random_coins_won.toString();
        gameObj.RandomLossCount = userResult.games[index].random_loss_count;
        gamesPlayed.push(gameObj);
    }

    userData.PlayedGames = gamesPlayed;

    if(userResult.privacy_policy) {
        //set privacy settings
        var privacy_policy = {};

        var friend_visibility = userResult.privacy_policy.friend_visibility;
        var message_permission = userResult.privacy_policy.message_permission;
        var friend_request = userResult.privacy_policy.friend_request;


        privacy_policy.FriendVisibility = friend_visibility || 0;
        privacy_policy.MessagePermission = message_permission || 0;
        privacy_policy.FriendRequest = friend_request || 0;
        userData.PrivacyPolicy = privacy_policy;
    }


    var friends = getFriends(userResult.lp_user_contacts);
 //   console.log("Friends : ",friends);

    var buddies = getBuddies(userResult.friends.buddies);

 //   console.log("Buddies :",buddies);

    //Send friends info acc to privacy settings
    var filteredUserFriends = filterFriendsOnFriendVisibility(privacy_policy.FriendVisibility,requestedBy,buddies, friends) ;

    userData.UserFriends = filteredUserFriends;

 //   console.log("Filetered user friends ",filteredUserFriends);

    userData.BuddyState = getBuddyState(userResult.friends.buddies,requestedBy);

    userData.IsFriends = checkIfFriends(requestedBy,filteredUserFriends);

    return userData;

}

function checkIfFriends(requestedBy,filteredUserFriends){
    var isFriends = false;
    for (var i = 0; i < filteredUserFriends.length; i++) {
        if (filteredUserFriends[i].UserId.toString() == requestedBy) {
            isFriends = true;
            break;
        }
    }
    return isFriends;
}

function filterFriendsOnFriendVisibility(friendVisibilityType,requestedBy,buddies, friends) {

    if(friendVisibilityType ==2)
        return [];


    var filteredUserFriends = buddies;

    for (var i = 0; i < friends.length; i++) {
        var friendIsBuddy = false;
        for (var j = 0; j < filteredUserFriends.length; j++) {
            if (friends[i].UserId.toString() === filteredUserFriends[j].UserId.toString()) {
                friendIsBuddy = true;
                break;
            }
        }
        if (friendIsBuddy == false)
            filteredUserFriends[filteredUserFriends.length] = friends[i];
    }
    if (friendVisibilityType == 0) {
        return filteredUserFriends;
    } else if (friendVisibilityType == 1) {

        if (checkIfFriends(requestedBy,filteredUserFriends)) {
            return filteredUserFriends;
        }
    }
    return filteredUserFriends;
}

function getFriends(contactsArray){
    var userFriends = [];

  //  console.log("Contacts Array " ,contactsArray);
    for (var index in contactsArray) {
        if (contactsArray[index].user_id) {

            var userObj = {};
            userObj.UserId = contactsArray[index].user_id._id;
            userObj.PlayerImageUrl = contactsArray[index].user_id.profile_pic_1;
            userObj.PlayerName = contactsArray[index].user_id.display_name;
            userObj.PlayerLevel = contactsArray[index].user_id.level.toString();
            userObj.PlayersCoin = contactsArray[index].user_id.balance.toString();

            userFriends.push(userObj);
        }
    }
    //  console.log('userFriends',userFriends);
    return userFriends;
}

function getBuddies(buddyArray) {
    // console.log('buddyArray---> ',buddyArray);
    var buddies = [];
    for (var i = 0; i < buddyArray.length; i++) {
        if(buddyArray[i].invitation_status == 1 && buddyArray[i].user_id) {
            buddies.push({
                UserId: buddyArray[i].user_id._id,
                PlayerImageUrl: buddyArray[i].user_id.profile_pic_1,
                PlayerName: buddyArray[i].user_id.display_name,
                PlayerLevel: buddyArray[i].user_id.level.toString(),
                PlayersCoin: buddyArray[i].user_id.balance.toString()
            });
        }
    }
    //  console.log('buddies',buddies);
    return buddies;
}

function getBuddyState(buddyArray,requestedBy) {
    var buddyState = 4; // default buddy state

    //  console.log("______>>>>",buddyArray)
    for (var i = 0; i < buddyArray.length; i++) {
        if (buddyArray[i].user_id && buddyArray[i].user_id._id.toString() === requestedBy ) {

            if (buddyArray[i].invitation_status == 0) {
                //pending
                //sending it for self (i.e. user1)
                if (buddyArray[i].invitation_type == 1) {
                    buddyState = 1;
                }
                else {
                    //waiting
                    buddyState = 0;
                }
            }
            else if(buddyArray[i].invitation_status == 1){
                buddyState = 2;
            }
            else if (buddyArray[i].invitation_type == 2) {
                //Rejected -- 3
                buddyState = 3;
            }
        }
    }

    return buddyState;
}





//************************* Generate Referral Link for sharing  *********************************************/

/**
 * Generate Referral link
 */
function generateReferralLink (request,response) {

    var referralId = request.params.id;
    if (!referralId) {
        logger.error("Missing referral id . Not redirecting ...");
        response.send({statuscode: 403, message: 'invalid referral id'});
        response.end();
    }
    else {
        var parser = new UAParser();
        var ua = request.headers['user-agent'];     // user-agent header from an HTTP request


        var iOSURL = "https://itunes.apple.com/us/app/amazing-street-food-maker/id558792300?mt=8";
        var androidURL = "https://play.google.com/store/apps/details?id=com.pocketplay.messenger&referrer=ppr_code%3D" + referralId.toString() + "%26ref_medium%3Dpp_player";
        var pocketplayURL = "http://pocketplay.com/";
        var osName = parser.setUA(ua).getOS().name;
        logger.info("Client device os-type received   : ", osName);

        switch (osName) {

            case 'Android':
            {
                logger.info("Redirecting to url : ", androidURL);
                response.redirect(androidURL);
                break;
            }
            case 'iOS':
            {
                logger.info("Redirecting to url : ", iOSURL);
                response.redirect(iOSURL);
                break;
            }
            case 'Windows':
            {
                logger.info("Redirecting to url : ", androidURL);
                response.redirect(androidURL);
                break;
            }
            case 'Mac OS':
            {
                logger.info("Redirecting to url : ", iOSURL);
                response.redirect(iOSURL);
                break;
            }
            default :
            {
                logger.info("Unidentified OS type of client . Redirecting to www.pocketplay.com...");
                response.redirect(pocketplayURL);
                break;
            }

        }
    }

}




//************************* MODULE EXPORTS *********************************************************************/

/**
 * Modules to be exported by other classes
 */
module.exports.getAdsData = getAdsData;
module.exports.fetchUserInfo = fetchUserInfo;
module.exports.fetchRandomFriendsInfo = fetchRandomFriendsInfo;
module.exports.fetchUserPrivacySettings = fetchUserPrivacySettings;
module.exports.generateReferralLink = generateReferralLink;

