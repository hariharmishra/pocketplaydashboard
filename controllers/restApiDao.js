/**
 * Created by harihar on 30/05/16.
 */


var request = require('request');
var logger = require('../logger/logger').getLogger('restApiDao');
var adsSchema = require('../database/models/adNetwork');
var user = require('../database/models/userSchema');
var httpCallsHandler = require('../controllers/httpCallsHandler');
var httpCallsConfig = require('../config/httpCallsConfiguration.js');
var redisUpdateUrl = require('../config/constants').INTER_SERVER_HTTP_POST_URL + '/update-redis';



//************************* Ads DBHandler *********************/

/**
 * Fetch ads data from db depending on osType
 * @param osType
 * @param cb
 */
function getAdsData(osType,cb){

    adsSchema.findOne({ad_networks_for_OS : osType}, function(err, queryOutput){
        if (err) {
            cb(err,null);
        }
        else {
            cb(null,queryOutput);
        }
    });

}



//************************* Privacy Settings DBHandler *********************/

/**
 *  Fetch user's Privacy settings from the db
 * @param userid
 * @param cb
 */
function fetchUserPrivacySettings(userid,cb) {
    user
        .findOne({_id: userid}, {privacy_policy: 1}, function (err, queryOutput) {
            if (err) {
                cb(err, null);
            }
            else {
                cb(null, queryOutput);
            }
        });
}



//************************* Random Pocket Play user(s) search DBHandler *********************/

/**
 *  Fetch Random pocketplay users
 * @param userid
 * @param searchText
 * @param timeStamp
 * @param cb
 */
function fetchRandomFriendsInfo(userid ,searchText,timeStamp, cb) {

    if (isNaN(searchText)) {
        var userArray = [];
        user
            .find({display_name: new RegExp(searchText, 'i')})
            .select({_id: 1})
            .exec(function (err, result) {
                if (err) {
                    cb(err, null);
                }
                else {

                    if (result != null) {

                        for (var i in result) {
                            userArray.push(result[i]._id);
                        }

                        // find user info for each id
                        user.find({_id: {$in: userArray}},
                            {
                                display_name: 1,
                                profile_pic_1: 1,
                                balance: 1,
                                level: 1
                            })
                            .limit(20)
                            .exec(function (err, queryOutput) {
                                //  console.log("QueryOutput : ",queryOutput);
                                if (err) {
                                    console.error("Unable to fetch user from db ", err);
                                    cb(err, null);
                                }
                                else {
                                    if (queryOutput != null) {

                                        var userData = {};
                                        var userFriends = [];
                                        for (var i in queryOutput) {
                                            if (queryOutput[i]._id.toString() == userid)
                                                continue;
                                            var obj = compileRandomFriendsInfoObject(queryOutput[i]);
                                            userFriends.push(obj);

                                        }
                                        userData.UserFriends = userFriends;
                                        userData.timeStamp = timeStamp;
                                        logger.info("Random search returned : ", userFriends.length, " pocket play users.");
                                        cb(null, userData);

                                    }
                                    else {
                                        cb(null, null);
                                    }
                                }
                            });
                    }
                    else {
                        logger.info('No user found with searchtext : ', searchText);
                        cb(null, null);
                    }
                }
            });
    } else {
        logger.info("Searching for player id : ", searchText);
        user.findOne({player_id: searchText}, {
            _id: 1,
            level: 1,
            balance: 1,
            display_name: 1,
            profile_pic_1: 1
        }, function (err, queryResult) {
            if (err) {
                cb(err, null);
            }
            else {

                if (queryResult != null && (queryResult._id.toString()!== userid) ) {

                    var userData = {};
                    var userFriends = [];
                    var obj = compileRandomFriendsInfoObject(queryResult);
                    userFriends.push(obj);

                    userData.UserFriends = userFriends;
                    userData.timeStamp = timeStamp;
                    cb(null, userData);

                }
                else {
                    logger.info('No user found with player-id : ', searchText);
                    cb(null, null);
                }

            }
        });
    }
}



/**
 * Get compiled userobject for random friends info
 * @param userResult
 * @returns compiled userObject
 */
function compileRandomFriendsInfoObject(userResult) {
    var userObj = {};
    if (userResult._id) {
        userObj.UserId = userResult._id;
        userObj.PlayerLevel = userResult.level.toString();
        userObj.PlayersCoin = userResult.balance.toString();
        userObj.PlayerImageUrl = userResult.profile_pic_1;
        userObj.PlayerName = userResult.display_name;
        return userObj;
    }
}

/**
 * Helper Methods ...
 *
 * @param subArray
 * @param superArray
 * @returns Filtered Array
 */
function arrayFilter(subArray,superArray){
    return superArray.filter(function(x) { return subArray.indexOf(x) < 0 });
}



//************************* User's info bundled with pocketplay friends/buddies DBHandler *********************/

function fetchUserInfo(requestedBy , requestedFor , cb){

    user
        .findOne({_id : requestedFor},{
            display_name: 1,
            profile_pic_1: 1,
            profile_pic_2: 1,
            profile_status: 1,
            balance: 1,
            level: 1,
            country_id: 1,
            profile_views: 1,
            matches_plays: 1,
            matches_won: 1,
            coins_won: 1,
            games :1,
            privacy_policy:1,
            "friends.buddies":1,
            "lp_user_contacts.user_id" :1
        })
        .populate('lp_user_contacts.user_id','display_name balance level profile_pic_1')
        .populate('friends.buddies.user_id','display_name balance level profile_pic_1')
        .exec(function (err, queryOutput) {
            //console.log("Query Output : ",queryOutput);

            if (err) {
                return cb(err,null);
            }
            else {
                if (!queryOutput) {
                    return cb(null, null);
                }
                else {
                    if (requestedBy != requestedFor) {
                        queryOutput.profile_views++;
                        logger.info("User1 is different from user2 . Profile views will be updated.");
                        cb(null, queryOutput);
                        updateProfileView(queryOutput._id, 1);
                        //return cb(null, queryOutput);

                    } else {
                        logger.info("User1 is same as User2. Not updating profile view .");
                        return cb(null, queryOutput);
                    }
                }
            }
        });

}

function updateProfileView(userId,profileView) {

    //user.update({_id:userId},{$set:{profile_views:profileView}},function(err,res){
    //    if(err){
    //        logger.error('Unable to update profile views in db ');
    //    }else {
    //        logger.info('Profile views updated for user in db.Alerting socket server...');
    //        var options = {};
    //        options.body = {docType : 'user', id :userId ,profile_view:profileView};
    //        options.json = true;
    //        options.method = 'post';
    //        request(redisUpdateUrl, options, function (error, response) {
    //            if(error){
    //                logger.error('Error updating redis at socket server for user : ',userId.toString());
    //            }else{
    //                logger.info('Redis updated at socket server for user : ',userId.toString());
    //            }
    //        });
    //    }
    //});

    logger.info('Profile views updated for user in db.Alerting socket server...');
    var dataToSend = {
        requestType: httpCallsConfig.DELETE_USER_FROM_REDIS,payLoad : {
            docType: 'user',
            profileViewArray: [
                {
                    id: userId,
                    profile_view: profileView       //profile_view delta is send
                }]
        }
    };    // redis profile view update

    httpCallsHandler.makeHttpRequest(dataToSend, 'post', function (error, response) {
        if (error) {
            logger.error('Error updating redis at socket server for user : ', userId.toString());
        } else {
            logger.info('Redis updated at socket server for user : ', userId.toString());
        }
    });
}



//************************* MODULE EXPORTS *********************/

/**
 * Module exports
 */
module.exports.getAdsData = getAdsData ;
module.exports.fetchUserInfo = fetchUserInfo ;
module.exports.fetchRandomFriendsInfo = fetchRandomFriendsInfo ;
module.exports.fetchUserPrivacySettings = fetchUserPrivacySettings;

