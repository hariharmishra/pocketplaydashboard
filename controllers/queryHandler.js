/**
 * Created by harihar on 26/02/16.
 */


var notification = require('../database/models/notificationSchema');
var user = require('../database/models/userSchema');
var redisController = require('./redisController');
var request = require('request');
var logger = require('../logger/logger').getLogger('queryHandler');
var redisUpdateUrl = require('../config/constants').INTER_SERVER_HTTP_POST_URL + '/update-redis';
logger.info("Redis post url : ",redisUpdateUrl);


//var updateCount = 0 ;
//var redisUpdateCount = 0;
//var responseCount = 0;
//var sameUserCount = 0;


/**** dummy test ******/
//var input = {type:0,title:'Holi Wishes5',message:'Happy wali Holi',
//            lastModified:new Date(),startDate:new Date(),deviceOS:'Android',status:1,countries:['Australia','India'],
//            data:{notif_Informative:{image:'google.com/img6',url:'www.pplay.com/update2',buttonText:'Update2'}} };

//var input = {type:1,title:'Diwali Wishes',message:'Happy Diwali',
//    lastModified:new Date(),startDate:new Date(),deviceOS:'iOS',status:0,countries:['USA','India'],
//    data:{notif_DailyDeals:{image:'google.com/img1',url:'www.pplay.com/update',buttonText:'Update',benifit:[{'coins':1000}]}} };

//var input = {type:0,title:'Christmas Wishes2',message:'Merry Xmas',
//    lastModified:new Date(),startDate:new Date(),deviceOS:'ios',status:1,countries:['USA','Russia','Europe'],
//    data:{notif_Informative:{image:'google.com/img5',url:'www.pplay.com/NewGame',buttonText:'Download'}} };
//
//var input = {type:0,title:'HBD',message:'happy wala birthday',
//    lastModified:new Date(),startDate:new Date(),deviceOS:'Both',status:1,countries:['Africa','China'],
//    data:{notif_Informative:{image:'google.com/img4',url:'www.pplay.com/HBD',buttonText:'Yo'}} };
//
//
//createNotification(input, function(err, result){
//
//});
//
//getAllNotifications(function(err, result){
//console.log(err,result);
//});

module.exports.createNotification = createNotification;
function createNotification(input,cb) {

    time = new Date().getTime() + (1000 *60*2);
    //console.log(time);
    var notif = new notification();
    console.log('\ninput',input);

    countries =[];
    countries = input.PairedSelectBox;
    data = {};
    notif_Informative ={};
    notif_Informative.image = input.bannerUrl;
    notif_Informative.url = input.url;
    notif_Informative.buttonText = input.redirectBtn;
    data.notif_Informative = notif_Informative;
        //set new notification entry attributes
    notif.type = 0;
    notif.title = input.title;
    notif.message = input.message;
    notif.startDate = input.date;
    notif.deviceOS = input.os;
    notif.status = 0;
    notif.countries = countries;
    notif.data = data;

    notif.save(function (err, queryOutput) {
        if (err) {
            console.error("Error saving new entry to database ", err);
            cb(err,null);
        }
        else {
            console.info("New Notification successfully saved to db " ,queryOutput);
            cb(null,queryOutput);
        }
    });
}


module.exports.updateNotification = function(input ,cb){


}


module.exports.getNotificationsBetweenDates = function(startDate ,endDate ,notificationType, cb){

    // filter results based on notificationType received.

    notification.find({startDate:  {  $gte : startDate ,
        $lte : endDate    }
    },{ title :1, startDate :1 , type :1, _id :1 },function(err,queryOutput){

        if (err) {
            console.error("Unable to fetch notification from db ", err);
            cb(err,null);
        }
        else {

            // console.info("\n\nNotification records found  :\n " ,typeof  queryOutput);
            cb(null,queryOutput);
        }

    });
}


function getAllNotifications(cb){

    notification.find({status : 1}, function(err, queryOutput){
        if (err) {
            console.error("Unable to fetch notifications from db ", err);
            cb(err,null);
        }
        else {
            console.info("\n\nNotification List :\n " ,queryOutput);
            cb(null,queryOutput);
        }
    });

}
module.exports.getAllNotifications = getAllNotifications ;

function getNotificationsByDate(date , cb){

    var nextDay = new Date(date).getTime() + (1000 * 60 * 60 * 24);
    notification.find({type : 0, startDate:  {  $gte : date , $lt : nextDay  }}, function(err, queryOutput){
        if (err) {
            console.error("Unable to fetch notifications from db ", err);
            cb(err,null);
        }
        else {
            cb(null,queryOutput);
        }
    });

}
module.exports.getNotificationsByDate = getNotificationsByDate ;

function getNotificationById(notifId , cb){


    notification.findOne({_id : notifId}, function(err, queryOutput){

        var notificationResponse ={};

        notificationResponse.title = queryOutput.title;
        notificationResponse.message = queryOutput.message;
        notificationResponse.startdate = queryOutput.startDate;
        notificationResponse.type = queryOutput.type;
        notificationResponse.notificationdata = queryOutput.data;

        if (err) {
            console.error("Unable to fetch notifications from db ", err);
            cb(err,null);
        }
        else {
            cb(null,notificationResponse);
        }
    });

}
module.exports.getNotificationById = getNotificationById ;


//var elementsToExclude = {
//    device_info: 0,
//    player_id: 0,
//    device_id: 0,
//    profile_pic_2: 0,
//    dob: 0,
//    gender: 0,
//    game_version: 0,
//    authorised_games: 0,
//    purchased_game: 0,
//    matches_loss: 0,
//    coins_loss: 0,
//    blocked_user: 0,
//    other_params: 0,
//    msisdn: 0,
//    send_queue: 0,
//    updated_tables: 0,
//    updated_chats: 0,
//    tables: 0,
//    created_at: 0,
//    updated_at: 0,
//    last_register_time: 0,
//    status: 0,
//    lp_table_contacts: 0,
//    lp_added_pals: 0,
//    login_type: 0,
//    image_text_version: 0,
//    purchased_products: 0
//};

function fetchUserInfo(requestedBy , requestedFor , cb){

    user
        .findOne({_id : requestedFor},{
            display_name: 1,
            profile_pic_1: 1,
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
            //console.log("---- RESPONSE FETCHED ----");
            //console.log(queryOutput);
            if (err) {
                console.error("Unable to fetch user from db ", err);
                cb(err,null);
            }
            else {
                if(!queryOutput) {
                    console.error("queryhandler : User not found in db");
                    cb(null,  null);
                }
                else {
                    var res = compileUserInfoResponse(queryOutput,requestedBy,requestedFor);
                    if(requestedBy != requestedFor){
                        //console.log("Initial profile view ",queryOutput.profile_views);
                        queryOutput.profile_views++;
                       // console.log("Updated Profile view ",queryOutput.profile_views);
                       // responseCount ++;
                       // console.log("**************************\nRESPONSE COUNT : "+ responseCount + "\n**************************");
                        cb(null,res);
                        
                        updateProfileView(queryOutput._id,queryOutput.profile_views);

                        /*queryOutput.save(function(err, success){
                            console.log("PROFILE VIEWS UPDATED ");
                            if(!err){
                                redisController.removeFromRedis('user', queryOutput._id, function(err){
                                    if(!err){
                                        console.log('user - '+queryOutput._id+' successfully deleted from redis');
                                        cb(null,res);
                                    }
                                    else{
                                        console.error('Unable to delete user - '+queryOutput._id+' from redis');
                                        cb(err,null);
                                    }
                                });
                            }else{
                                console.error("Error updating profile view in db");
                                cb(err, null);
                            }
                        });*/
                    }else{
                        console.log('USER1 == USER2');
                        //responseCount++;
                        //sameUserCount++;
                        //console.log("**************************\nRESPONSE COUNT : "+ responseCount + "\n**************************");
                        //console.log("**************************\nSAME USERS COUNT : "+ sameUserCount + "\n**************************");

                        cb(null, res);
                    }


                }
            }
        });

}
module.exports.fetchUserInfo = fetchUserInfo ;

function updateProfileView(userId,profileView){

    user.update({_id:userId},{$set:{profile_views:profileView}},function(err,res){
        if(err){
            logger.error('Unable to update profile views in db ');
            return ;
        }else {
            logger.info('Profile views updated for user in db.Alert socket server...');
            var options = {};
            options.body = {docType : 'user', id :userId};
            options.json = true;
            options.method = 'post';
            request(redisUpdateUrl, options, function (error, response) {
                if(error){
                    logger.error('Error updating redis at socket server for user : ',userId.toString());
                }else{
                    logger.info('Redis updated at socket server for user : ',userId.toString());
                }
            });
        }

        //if(!err){
        //    redisController.removeFromRedis('user', userId , function(err){
        //        if(!err){
        //            console.log('user -> '+ userId +' successfully deleted from redis');
        //           // updateCount++;
        //           // redisUpdateCount++;
        //            console.log("PROFILE VIEWS UPDATED for user : ",userId ," AND REDIS SUCCESS.");
        //          //  console.log("**************************\nUPDATE COUNT : "+ updateCount + " | REDIS UPDATE COUNT " + redisUpdateCount +"\n**************************");
        //        }
        //        else{
        //            console.error('Unable to delete user -> '+ userId +' from redis');
        //           // updateCount++;
        //            console.log("PROFILE VIEWS UPDATED for user : ",userId ," BUT REDIS ERROR.");
        //          //  console.log("**************************\nUPDATE COUNT : "+ updateCount +"\n**************************");
        //
        //        }
        //    });
        //}else{
        //
        //}
    });
}

function compileUserInfoResponse(userResult,requestedBy) {
    var userData = {};
    var gamesPlayed = [];

    userData.PlayerName = userResult.display_name;
    userData.PlayerImageUrl = userResult.profile_pic_1;
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
    var buddies = getBuddies(userResult.friends.buddies);

    //Send friends info acc to privacy settings
    var filteredUserFriends = filterFriendsOnFriendVisibility(privacy_policy.FriendVisibility,requestedBy,buddies, friends) ;

    userData.UserFriends = filteredUserFriends;


    var buddyState = getBuddyState(userResult.friends.buddies,requestedBy);

    userData.BuddyState = buddyState;

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




//***********************************************************
function fetchFriendsInfo(requestedFor ,searchText, cb) {

    //var userData = {};
    console.log("user info requested for : ", requestedFor, ' search text -> ', searchText);

    user
        .findOne({_id: requestedFor})
        .populate('lp_user_contacts.user_id', '')
        .exec(function (err, queryOutput) {

            if (err) {
                console.error("Unable to fetch user from db ", err);
                cb(err, null);
            }
            else {
                // console.info("\n\nUser List :\n " ,queryOutput);
                if (queryOutput == null) {
                    cb(null, null);
                }
                else {
                    var res = compileUserFriendsInfoResponse(queryOutput);
                    cb(null, res);
                }
            }
        });
}

module.exports.fetchFriendsInfo = fetchFriendsInfo ;

function compileUserFriendsInfoResponse(userResult){
    var userData ={};
    var userFriends =[];
    for (var index in userResult.lp_user_contacts){
        var userObj={};
        if(userResult.lp_user_contacts[index].user_id) {
            userObj.UserId = userResult.lp_user_contacts[index].user_id._id;
            userObj.PlayerLevel = userResult.lp_user_contacts[index].user_id.level.toString();
            userObj.PlayersCoin = userResult.lp_user_contacts[index].user_id.balance.toString();
            console.log("userobj "+userObj);
            userFriends.push(userObj);
        }

    }

    userData.UserFriends    =   userFriends;
    return userData;
}


function fetchRandomFriendsInfo(userid ,searchText,timeStamp, cb) {

   // console.log("user info requested for : ", userid);

    var superArray = [];
    var subArray = [];

    user
        .find({display_name: new RegExp(searchText, 'i')})
        .select({"display_name": 1})
        .exec(function (err, queryOutput) {

            if (err) {
                console.error("Unable to fetch user from db ", err);
                cb(err, null);
            }
            else {
                // console.info("\n\nUser List :\n " ,queryOutput);
                if (queryOutput != null) {

                    //console.log(queryOutput);
                    for (var i in queryOutput) {
                        // var userObj = {};
                        // userObj._id = queryOutput[i]._id;
                        // userObj.display_name = queryOutput[i].display_name;
                       // console.log(queryOutput[i].display_name);
                        superArray.push(queryOutput[i]._id);
                    }
                   // console.log("\nsuperArray ---->", superArray);
                    // Find friends of received userid
                    user
                        .findOne({_id: userid})
                        .populate('lp_user_contacts.user_id', '')
                        .exec(function (err, queryOutput) {

                            if (err) {
                                console.error("Unable to fetch user from db ", err);
                                cb(err, null);
                            }
                            else {
                                if (queryOutput != null) {

                                    for (var index in queryOutput.lp_user_contacts) {

                                        if (queryOutput.lp_user_contacts[index].user_id) {
                                            // userObj2._id = queryOutput.lp_user_contacts[index].user_id._id;
                                            //  userObj2.display_name = queryOutput.lp_user_contacts[index].display_name;
                                           // console.log(queryOutput.lp_user_contacts[index].display_name);
                                            subArray.push(queryOutput.lp_user_contacts[index].user_id._id);
                                        }
                                    }
                                 //   console.log("\nsubArray ---->", subArray);
                                    var finalArray = [];
                                   // finalArray = arr_diff(superArray, subArray);
                                    finalArray = arrayFilter(subArray,superArray);
                                 //   console.log('finalArray ---> ' ,finalArray);

                                    // find user info for each id

                                    user.find({_id : {$in: finalArray}})
                                        .populate('user_id','')
                                        .exec(function (err, queryOutput) {
                                        if (err) {
                                            console.error("Unable to fetch user from db ", err);
                                            cb(err, null);
                                        }
                                        else {
                                            // console.log(queryOutput);

                                            if (queryOutput != null) {
                                                //var resArray = [];
                                                var userData = {};
                                                var userFriends = [];
                                                for (var i in queryOutput) {
                                                    if (queryOutput[i]._id.toString() == userid)
                                                        continue;
                                                    var obj = compileRandomFriendsInfoObject(queryOutput[i]);
                                                    //console.log("\n\n" ,obj);
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
                            }
                        });
                }
            }
        })
}
module.exports.fetchRandomFriendsInfo = fetchRandomFriendsInfo ;


function fetchUserPrivacySettings(userid,cb) {

    console.log("user info requested for : ", userid);

    user
        .findOne({_id: userid}, {privacy_policy: 1}, function (err, queryOutput) {
            if (err) {
                console.error("Unable to fetch user privacy from db ", err);
                cb(err, null);
            }
            else {
                var res = userPrivacyResponse(queryOutput);
                cb(null, res);
            }

        });

}
module.exports.fetchUserPrivacySettings = fetchUserPrivacySettings;


function userPrivacyResponse(result){
    console.log(result);

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

function compileRandomFriendsInfoObject(userResult) {


   // console.log("userresult" , userResult._id);
    //for (var index in userResult){

        var userObj={};
        //console.log(userResult[index].user_id);
        if(userResult._id) {

            userObj.UserId = userResult._id;
            userObj.PlayerLevel = userResult.level.toString();
            userObj.PlayersCoin = userResult.balance.toString() ;
            userObj.PlayerImageUrl = userResult.profile_pic_1;
            userObj.PlayerName = userResult.display_name;
            return userObj;
        }

   // }*/

}

function arrayFilter(subArray,superArray){
    superArray = superArray.filter(function(x) { return subArray.indexOf(x) < 0 })
    return superArray;
}












