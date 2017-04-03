/**
 * Created by harihar on 21/04/16.
 */

var path = require('path');
var notificationsController = require('../controllers/notificationsController');
var gamesController = require('../controllers/gamesController');
var inAppController = require('../controllers/inAppController');
var configHandler = require('../controllers/configurationHandler');
var httpCallsConfig = require('../config/httpCallsConfiguration.js');
var adNetworkHandler = require('../controllers/adNetworkHandler');
var testUserHandler = require('../controllers/testUserHandler');
var restApiController = require('../controllers/restApiController');
var rechargeApiController = require('../controllers/rechargeApiController');
var publicSiteHandler = require('../controllers/publicSiteHandler');
var constants = require('../config/constants');
var snsHandler = require('../controllers/snsHandler');
var ratingAndFeedbackHandler = require('../controllers/ratingAndFeedbackHandler');
var im_proc = require('../lib/imageProcessor');
var logger = require('../logger/logger.js').getLogger('router_live');
var formidable = require('formidable');
var fs = require('fs-extra');
var userAuth ={};



// ********   ROUTES FOR LIVE SERVER   *********

exports.initExpress =  function initExpress(app) {

   logger.info('\nRoutes for LIVE SERVER are functional now.Proceed...\n');

    /**
     * ALL GET REQUESTS
     */

    app.get('/', function (request, response) {
        console.log('received a GET request for /');
        if (userAuth['username'])
            response.redirect('/all_games_live');
        else
            response.sendFile(path.resolve(__dirname + '/../views/index.html'));
    });

    app.post('/login', function (request, response) {
        console.log('received a POST request for /login', request.body);

        if (request.body.username == 'admin@pocketplay.com' && request.body.password == 'admin@123') {
            userAuth['username'] = true;
            response.redirect('/all_games_live');
        }
        else {
            response.redirect('/?error=Invalid username or password');
        }
    });

    app.get('/logout', function (request, response) {
        console.log('logged out');
        delete userAuth['username'];
        response.redirect('/');
    });

    app.get('/all_games_live', function (request, response) {
        console.log('received a GET request for /all_games_live');
        if (userAuth['username']) {
            gamesController.getAllGames(function (err, obj) {
                if (!err) {
                    console.log(obj);
                    response.render(path.resolve(__dirname + '/../views/games/all_games_live.jade'), obj);
                }
            });
        }
        else {
            response.redirect('/');
        }

    });

    app.get('/published_game_details/:gameid', function (request, response) {
        console.log('received a GET request for /published_game_details');
        if (userAuth['username']) {
            gamesController.getPublishedGameDetails(request, function (err, obj) {
                if (!err) {
                    console.log(obj);
                    response.render(path.resolve(__dirname + '/../views/games/game_details.jade'), obj);
                }
            });
        }
        else {
            response.redirect('/');
        }

    });

    app.get('/game_details_live/:gameid', function (request, response) {
        console.log('received a GET request for /game_details_live');
        if (userAuth['username']) {
            gamesController.getGameDetails(request, function (err, obj) {
                if (!err) {
                    console.log(obj);
                    response.render(path.resolve(__dirname + '/../views/games/game_details_live.jade'), obj);
                }
            });
        }
        else {
            response.redirect('/');
        }

    });

    app.get('/edit_game_details_live/:gameid', function (request, response) {
        console.log('received a GET request for /edit_game_details_live');
        if (userAuth['username']) {
            if(request.params.gameid == 'newgame')
                response.redirect('/all_games_live?error=Invalid game id');
            else{
                gamesController.getGameDetails(request, function (err, obj) {
                    if (!err) {
                        console.log(obj);
                        response.render(path.resolve(__dirname + '/../views/games/edit_game_details_live.jade'), obj);
                    }
                    else {
                        response.redirect('/all_games_live?error=Cannot add new game');
                    }
                });
            }

        }
        else {
            response.redirect('/');
        }

    });

    app.get('/delete_game/:gameid', function (request, response) {
        logger.info('received a GET request for /delete_game/',request.params.gameid);
        response.send({"statusCode": "403"});
        response.end();
        logger.info("Delete request not authorized.Response code 403 sent.");
        //if (userAuth['username']) {
        //    gamesController.deleteGameDetails(request, function (err, obj) {
        //
        //        if (!err) {
        //            response.redirect('/all_games_live');
        //        }
        //        else {
        //            console.error(err);
        //        }
        //    });
        //}
        //else {
        //    response.redirect('/');
        //}

    });

    app.get('/in_app', function (request, response) {
        console.log('received a GET request for /in_app');
        if (userAuth['username']) {
            inAppController.getAllIAPs(function (err, obj) {
                if (!err) {
                    response.render(path.resolve(__dirname + '/../views/in_app/in_app.jade'), obj);
                }
            });
        }
        else {
            response.redirect('/');
        }

    });

    app.get('/config', function (request, response) {
        console.log('received a GET request for /config');
        if (userAuth['username']) {
            configHandler.getConfiguration(function (err, obj) {
                if (!err) {
                    response.render(path.resolve(__dirname + '/../views/config/config.jade'), obj);
                }
            });
        }
        else {
            response.redirect('/');
        }

    });

    app.get('/test_user', function (request, response) {
        console.log('received a GET request for /test_user');
        if (userAuth['username']) {

            response.render(path.resolve(__dirname + '/../views/test_user/test_user.jade'));

        }
        else {
            response.redirect('/');
        }

    });

    app.get('/comingsoon', function (request, response) {
        console.log('received a GET request for /commingsoon');
        if (userAuth['username']) {

            response.render(path.resolve(__dirname + '/../views/coming_soon/comingsoon.jade'));

        }
        else {
            response.redirect('/');
        }

    });

    app.get('/appoftheday', function (request, response) {
        console.log('received a GET request for /appoftheday');
        if (userAuth['username']) {
            showCalendarView('appoftheday', request, response);
        }
        else {
            response.redirect('/');
        }
    });

    app.get('/dailydeals', function (request, response) {
        console.log('received a GET request for /dailydeals');
        if (userAuth['username']) {
            showCalendarView('dailydeals', request, response);
        }
        else {
            response.redirect('/');
        }
    });

    app.get('/informative', function (request, response) {
        console.log('received a GET request for /informative');
        if (userAuth['username']) {
            showCalendarView('informative', request, response);
        }
        else {
            response.redirect('/');
        }
    });

    app.get('/dailydealslist/:date', function (request, response) {
        console.log('received a GET request for /dailydealslist');
        if (userAuth['username']) {
            showNotificationsByDate('dailydeals', request, response);
        }
        else {
            response.redirect('/');
        }
    });

    app.get('/appofthedaylist/:date', function (request, response) {
        console.log('received a GET request for /appofthedaylist');
        if (userAuth['username']) {
            showNotificationsByDate('appoftheday', request, response);
        }
        else {
            response.redirect('/');
        }
    });

    app.get('/infolist/:date', function (request, response) {
        console.log('received a GET request for /infolist/:');
        if (userAuth['username']) {
            showNotificationsByDate('informative', request, response);
        }
        else {
            response.redirect('/');
        }
    });

    app.get('/promo_ginfo_addnew.jade', function (request, response) {
        console.log('received a GET request for /promo_ginfo_addnew.jade');
        response.render(path.resolve(__dirname + '/../views/informative/promo_ginfo_addnew.jade'));

    });

    app.get('/getAllNotifications', function (request, response) {
        console.log('received a GET request for /getAllNotifications');
        notificationsController.getAllNotifications(request, response);
    });

    app.get('/getNotification/:id', function (request, response) {
        console.log('received a GET request for /getNotification');
        notificationsController.getNotificationById(request, response);
    });

    app.get('/ads_config_ios', function (request, response) {
        if (userAuth['username']) {
            adNetworkHandler.getAdData('ios', function (err, adData) {
                if (err) {
                    response.render(path.resolve(__dirname + '/../views/ad_network/ads_config_ios.jade'), null);
                } else {
                    response.render(path.resolve(__dirname + '/../views/ad_network/ads_config_ios.jade'), adData);
                }
            });

        }
        else {
            response.redirect('/');
        }

    });

    app.get('/ads_config_android', function (request, response) {
        if (userAuth['username']) {
            adNetworkHandler.getAdData('android',function (err, adData) {
                if (err) {
                    response.render(path.resolve(__dirname + '/../views/ad_network/ads_config_android.jade'),null);
                }else{
                    response.render(path.resolve(__dirname + '/../views/ad_network/ads_config_android.jade'),adData);
                }
            });
        }
        else {
            response.redirect('/');
        }

    });

    app.get('/recharge_response',function(request,response){
        rechargeApiController.updateRechargeTransaction(request,response);
    });

    app.get('/referral/:id',function(request,response){
        restApiController.generateReferralLink(request,response);
    });


    /**
     * ALL POST REQUESTS
     */

    app.post('/createinapp', function (request, response) {
        console.log('received a POST request for /createinapp');

        if (userAuth['username']) {
            inAppController.saveIAP(request, function (err, obj) {

                if (!err) {
                    if (obj != null)
                        response.redirect('/in_app');
                    else
                        response.redirect('/in_app?error=already exists');
                }
            });
        }
        else {
            response.redirect('/');
        }

    });

    app.post('/updateinapp', function (request, response) {
        console.log('received a POST request for /updateinapp');

        if (userAuth['username']) {
            inAppController.updateIAP(request, function (err, obj) {

                if (!err) {
                    if (obj != null)
                        response.redirect('/in_app');
                    else
                        response.redirect('/in_app?error=already exists');
                }
            });
        }
        else {
            response.redirect('/');
        }

    });

    app.post('/updateconfig', function (request, response) {
        console.log('received a POST request for /updateconfig');

        if (userAuth['username']) {
            configHandler.saveConfiguration(request, function (err, obj) {

                if (!err) {
                    if (obj != null)
                        response.redirect('/config');
                    else
                        response.redirect('/config?error=some error occurred while updating...');
                }
            });
        }
        else {
            response.redirect('/');
        }

    });

    app.post('/createNewNotification', function (request, response) {
        console.log('received a POST request for /createNewNotification');
        notificationsController.createNewNotification(request, response);
    });

    app.post('/updateNotification', function (request, response) {
        console.log('received a POST request for /updateNotification');
        notificationsController.updateNotification();
    });

    app.post('/deleteinapp', function (request, response) {
        console.log('received a GET request for /deleteinapp');
        if (userAuth['username']) {
            inAppController.deleteIAP(request, function (err, msg) {
                //console.log('msg==>',msg);
                if (!err) {
                    response.type('application/json');
                    response.end(JSON.stringify(msg));
                }
            });
        }
        else {
            response.redirect('/');
        }

    });

    app.post('/upload_resources', function (request, response) {
        console.log('received a POST request for /upload_resources');
        if (userAuth['username']) {
            gamesController.upload_resources(request, function (err, res) {
                if (!err) {
                    console.log("!!!! Sending response : ", res._id);
                    response.redirect('/edit_game_details/' + res._id + '?success=Game resource successfully uploaded !!!');
                }
                else {
                    response.redirect('/edit_game_details/' + res._id + '?error=Error uploading game resource !!!');
                }
            });
        }
        else {
            response.redirect('/');
        }

    });

    app.post('/live_saveGameDetails', function (request, response) {

        console.log('received a POST request for /live_saveGameDetails');
        if (userAuth['username']) {
            gamesController.live_saveGameDetails(request, function (err, res) {

                if (!err) {
                    console.log("!!!! Sending response : ", res);

                    if (res.asset_validation == true)
                        response.redirect('/all_games_live');
                    else if (res.asset_validation == false)
                        response.redirect('/edit_game_details_live/' + res._id + '?error=publish failed');
                    else {
                        if (res.is_published)
                            response.redirect('/edit_game_details_live/' + res._id + '?success=Game with id : ' + res._id + '  successfully PUBLISHED !!!');
                        else
                            response.redirect('/edit_game_details_live/' + res._id + '?success=Game with id : ' + res._id + '  successfully SAVED !!!');
                    }
                }
                else {
                    response.redirect('/edit_game_details_live/' + res._id + '?error=publish failed');
                }
            });
        }
        else {
            response.redirect('/');
        }

    });

    app.post('/save_ad_configs', function (request, response) {
        if (userAuth['username']) {
            adNetworkHandler.saveAd(request, function (err, obj) {
                console.log(obj.os_type);
                if (err) {
                    if (obj.os_type.toString() == "ios")
                        response.redirect('/ads_config_ios');
                    else
                        response.redirect('/ads_config_android');
                }
                else {
                    if (obj.os_type.toString() == "ios")
                        response.redirect('/ads_config_ios');
                    else
                        response.redirect('/ads_config_android');
                }
            });
        }
        else {
            response.redirect('/');
        }

    });

    app.post('/create_test_user', function (request, response) {
        if (userAuth['username']) {
            testUserHandler.saveTestUser(request, function (err, msg) {
                if (err) {
                    response.redirect('/test_user?msg=' + encodeURIComponent('Error saving test user'));
                }
                else {
                    response.redirect('/test_user?msg=' + encodeURIComponent(msg));
                }
            });
        }
        else {
            response.redirect('/');
        }

    });

    app.post('/delete_test_user', function (request, response) {
        if (userAuth['username']) {
            testUserHandler.deleteTestUser(request, function (err, msg) {

                if (!err) {
                    response.type('application/json');
                    response.end(JSON.stringify(msg));
                }
            });
        }
        else {
            response.redirect('/');
        }

    });

    app.post('/GetGameFromQA', function (request, response) {
        console.log('received a POST request for /GetGameFromQA');
        gamesController.live_SaveORUpdateGameToStaging(request.body, function (err, res) {
            console.log("Request Body received at Live server --- >", request.body);
            if (err) {
                response.redirect('/game_details/' + res.gameid + '?msg=Error saving game to Live Server');
            }
            else {
                response.redirect('/game_details/' + res.gameid + '?msg=Game Successfully saved to Live Server');
            }
        });
    });

    app.post('/recharge',function(request,response){
        rechargeApiController.requestRecharge(request,function(res){
            response.send(res);
            response.end();
        });
    });

    app.post('/contactus',function(request,response){

    });

    app.post('/subscribe',function(request,response){
        publicSiteHandler.addSubscriber(request,response);
    });

    app.post('/unsubscribe',function(request,response){
        publicSiteHandler.removeSubscriber(request,response);
    });


    /**
     * HTTP calls from the client side
     */

    app.post('/fetchUserInfo', function (request, response) {
        restApiController.fetchUserInfo(request, response);
    });

    app.post('/fetchRandomFriendsInfo', function (request, response) {
        restApiController.fetchRandomFriendsInfo(request, response);
    });

    app.post('/fetchUserPrivacySettings', function (request, response) {
        restApiController.fetchUserPrivacySettings(request, response);
    });

    app.post('/getAdsData',function(request,response){
        restApiController.getAdsData(request,response);
    });

    app.post('/setRatingAndFeedback',function(request, response) {
        ratingAndFeedbackHandler.saveRatingAndFeedback(request, response);
    });



    app.post('/s3ImageHandler',function(request,response){
        //console.log("REQUEST BODY === > ",request.body);
        snsHandler.filterSNSMessage(request.body);
        response.send(200);
        response.end();
    });



    // For profile pic upload
    app.route('/upload').post(function (req, res, next) {

        var form = new formidable.IncomingForm();
        var newFileName;
        var file_1_name;
        var file_2_name;

        var uploadPath = path.join(path.resolve(__dirname + '/../uploads/profileimage/'), '/');

        form.parse(req, function (err, fields, files) {
            //if (fields) {
            //    console.info(fields.toString());
            //}
            fields.path = '/profileimage/';
            newFileName = fields.title;
            if (!newFileName) {
                return;
            }
            file_1_name = newFileName.replace(".jpg", "_1.jpg");
            file_2_name = newFileName.replace(".jpg", "_2.jpg");
            fields.file_1 = file_1_name;
            fields.file_2 = file_2_name;

            var userId = newFileName.split('.jpg')[0];
            var dataToSend = {
                "requestType": httpCallsConfig.USER_PROFILE_PIC_UPDATED,
                "payLoad": {"userId": userId, "file_1_name": file_1_name, "file_2_name": file_2_name}
            };
            require('../controllers/httpCallsHandler').makeHttpRequest(dataToSend, 'post', function (err, result) {
                if (err) {
                    logger.error(err);
                    res.writeHead(500, {'content-type': 'text/plain'});
                    res.end();
                }
                else {
                    logger.info('profile pic successfully uploaded for userd id : ',userId);
                    fields.version = result.image_text_version;
                    res.writeHead(200, {'content-type': 'text/plain'});
                    res.write(JSON.stringify(fields));
                    res.end();
                }
            });
        });

        form.on('error', function (err) {
            logger.error(err);
        });

        form.on('end', function (fields, files) {
            /* Temporary location of our uploaded file */
            var temp_path = this.openedFiles[0].path;
            /* The file name of the uploaded file */
            var file_name = this.openedFiles[0].name;
            /* Location where we want to copy the uploaded file */
            var new_location = uploadPath;
            //util.inspect({fields: fields, files: files})
            if (newFileName == null)
                newFileName = file_name;
            if (!newFileName)
                return;
            fs.copy(temp_path, new_location + newFileName, function (err) {
                if (err || newFileName.length == 0) {
                    console.error(err);
                } else {
                    console.log("success!");
                    im_proc.resizeImage(new_location + newFileName, new_location + file_1_name, 128, function (err) {
                        if (err) {
                            logger.error("ERROR RESIZING IMAGE " + newFileName + " TO 128");
                        } else {
                            logger.info("IMAGE RESIZED TO 96: " + newFileName);
                            // todo call update user pic here with var userId
                        }
                    });
                    im_proc.resizeImage(new_location + newFileName, new_location + file_2_name, 512, function (err) {
                        if (err) {
                            logger.error("ERROR RESIZING IMAGE " + newFileName + " TO 512");
                        } else {
                            logger.info("IMAGE RESIZED TO 192: " + newFileName);
                        }
                    });
                }
            });
        });
    });

    app.route("/profilepicupload").get(function (req, res) {
        res.writeHead(200, {'content-type': 'text/html'});
        logger.info("RECEIVED REQUEST FOR BASE PAGE");
        res.end(
            '<form action="/upload" enctype="multipart/form-data" method="post">' +
            '<input type="file" name="upload" multiple="multiple"><br>' +
            '<input type="text" name="title"><br>' +
            '<input type="submit" value="Upload">' +
            '</form>'
        );

    });







    // Helpers
    function showCalendarView(notificationType,request,response){

        notificationsController.getNotificationsBetweenDates(notificationType, request , function( err,data){

            var renderPath =    path.resolve(__dirname + '/../views/' + notificationType);
            switch(notificationType){
                case "appoftheday" : renderPath += "/promo_aod_calview.jade"; break;
                case "dailydeals" : renderPath += "/promo_dd_calview.jade"; break;
                case "informative" : renderPath += "/promo_ginfo_calview.jade"; break;
                default : renderPath += "/promo_dd_calview.jade"; break;
            }

            if(data.status == 200){
                console.info("DATA ===> ",data);
                response.render( renderPath , {data: data.message});
            }
            else  if(data.status == 404){
                response.render( renderPath , {data: null});
            }
        });
    }

    function showNotificationsByDate(notificationType,request,response){

        notificationsController.getNotificationsByDate(notificationType, request , function(err, data){

            var renderPath =   __dirname + '/../views/' + notificationType;
            switch(notificationType){
                case "appoftheday" : renderPath += "/promo_aod_list.jade"; break;
                case "dailydeals" : renderPath += "/promo_dd_list.jade"; break;
                case "informative" : renderPath += "/promo_ginfo_list.jade"; break;
                default : renderPath += "/promo_ginfo_list.jade"; break;
            }

            if(data.status == 200){
                console.info("DATA ===> ",data);
                response.render( renderPath,{data: data.message});
            }
            else  if(data.status == 404){
                response.render( renderPath,{data: null});
            }
        });
    }


};

