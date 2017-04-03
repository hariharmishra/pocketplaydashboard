/**
 * Created by harihar on 26/02/16.
 */

    var queryHandler = require('../controllers/queryHandler');
    var fse = require('fs-extra');
    var formidable = require('formidable');
    var path = require('path');
    var moment = require('moment');
    var logger = require('../logger/logger.js').getLogger('notificationsController');



    // Get all saved notifications within dates bracket , if any

    module.exports.getNotificationsBetweenDates = function getNotificationsBetweenDates(notificationType, request , cb) {

        var currentDate  = request.query.currentDate || new Date() ;

        console.log('current date :  ', currentDate  );

        console.log('Notification Type :  ', notificationType );

            // Anything except M/D/Y is considered INVALID

            /** parse start and end date from input date **/

            var dateRecieved = new Date(currentDate);
            console.log("date received ",dateRecieved);


            var firstDay = new Date(dateRecieved.getFullYear(), dateRecieved.getMonth(), 1);
            var lastDay = new Date(dateRecieved.getFullYear(), dateRecieved.getMonth() + 1, 0);

            var daysOfMonth = ((lastDay - firstDay)/(1000 * 60 * 60 * 24)) + 1;
            var preDays = firstDay.getDay();
            var postDays = 42 - (daysOfMonth + preDays);

            var startDate = new Date(new Date(firstDay) - (1000 * 60 * 60 * 24 * preDays));
            var endDate = new Date(+new Date(lastDay) + (1000 * 60 * 60 * 24 * postDays));

            console.log(startDate , endDate);



        // query db for notifications between given dates

        queryHandler.getNotificationsBetweenDates(startDate ,endDate ,notificationType , function(err,queryResult){
            if (err) {
                console.error("Error fetching record : ", err);
                cb(err,{'status': 404, 'message': null});
            }
            else {
               // console.info("Record Fetched : \n", queryResult);

                cb(null,{'status': 200, 'message': queryResult});
            }
        });
    }





    // get notification details based on unique notification id

    module.exports.getAllNotifications = function getAllNotifications(request,response){

        queryHandler.getAllNotifications(function (err, queryResult) {
            response.type('application/json');
            if (err) {
                console.error("Error fetching records : ", err);
                response.end(JSON.stringify({'status': 404, 'message': "No Entry found in database .\n"}));

            }
            else {
                console.info("Records Fetched : \n", queryResult);
                response.end(JSON.stringify({'status': 200, 'message': queryResult}));

            }
        });

    }


    module.exports.getNotificationsByDate = function getNotificationsByDate(notificationType,request,cb){
        var date = request.params.date;
        var isValid = moment(date).isValid();
        console.log(isValid);
        if(isValid) {
            queryHandler.getNotificationsByDate(date , function (err, queryResult) {

                if (err) {
                    console.error("Error fetching records : ", err);
                    //response.end(JSON.stringify({'status': 404, 'message': "No Entry found in database .\n"}));
                    cb(err, {'status': 404, 'message': null});
                }
                else {
                   // console.info("Records Fetched : \n", queryResult);
                    //response.end(JSON.stringify({'status': 200, 'message': queryResult}));
                    cb(null, {'status': 200, 'message': queryResult});
                }
            });
        }
        else {
            console.log('Error : Not a valid date');
            cb(err, {'status': 400, 'message': null});
        }

    }


    // get notification

    module.exports.getNotificationById = function getNotificationById(request,response,cb) {

        response.type('application/json');
        var notifId = request.params.id;

        queryHandler.getNotificationById(notifId, function (err, queryResult) {

            if (err) {
                console.error("Error fetching records : ", err);
                response.end(JSON.stringify({'status': 500, 'message': "Internal server error.\n"}));
            }
            else {
                console.info("Response successfully sent  : \n", queryResult, "\n\n");
                if (queryResult == null) {

                    response.end(JSON.stringify({
                        'status': 404,
                        'message': 'User requested for is not found',
                        'data': queryResult
                    }));
                }
                else {

                    response.end(JSON.stringify({
                        'status': 200,
                        'message': 'successfull',
                        'data': queryResult
                        }));
                }

            }
        });
    }






    // update notification

    module.exports.updateNotification = function updateNotification(request,response){

        input =[];  //create input array

        queryHandler.updateNotification(input ,function (err, queryResult) {
            if (err) {
                console.error("Error fetching record : ", err);
                response.end(JSON.stringify({'status': 404, 'message': "No Entry found in database .\n"}));
            }
            else {
                console.info("Record Fetched : \n", queryResult);
                response.end(JSON.stringify({'status': 200, 'message': queryResult}));
            }
        })

    };




    // Create new notification

    module.exports.createNewNotification = function createNewNotification(request,response) {

        var form = new formidable.IncomingForm();
        var fields = {};
        //set attributes

        form.keepExtensions = true;
        console.log(__dirname);
        var uploadPath = path.join(path.resolve( __dirname + '/../uploads/img/'),'/') ;
        console.info('\nUpload Path ',uploadPath);
        form.uploadDir =  uploadPath;

        form.on('aborted', function (err) {
            console.error("File upload  ABORTED by user");
        });

        form.on('error', function (err) {
            console.error("Within error", err);
            response.end('Error occured ', err);

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

        form.on('progress', function (bytesReceived, bytesExpected) {
            var percent_complete = (bytesReceived / bytesExpected) * 100;
            console.log(percent_complete.toFixed(2));
        });


        form.on('end', function () {

            /* Temporary location of our uploaded file */
            var temp_path = this.openedFiles[0].path;
            /* The file name of the uploaded file */
            var file_name = this.openedFiles[0].name;
            /* Location where we want to copy the uploaded file */
            var new_location = uploadPath + file_name;
            console.log("\nnew location",new_location);

            //check for valid file upload
            var extension = file_name.split('.').pop().toString();
            console.log('uploaded file extension = ', extension);

            if ((extension.localeCompare("jpeg") != 0) && (extension.localeCompare("jpg") != 0) && (extension.localeCompare("png") != 0)) {
                console.error("Media uploaded is not of preferred type : ", extension);

                form.emit('error', new Error("Invalid Media type uploaded"));
                removeFile(temp_path);
            }
            else {
                // valid file extension...start uploading .

                fse.copy(temp_path, new_location, function (err) {
                    if (err) {
                        console.error(err);
                        response.end(err);
                    } else {
                        console.log("file successfully copied!");
                    }

                    console.log(fields);
                    // Save everything to db
                    if (fields === undefined) {
                        console.error("Undefined form fields");
                        form.emit('error', new Error("Undefined form fields"));
                        removeFile(temp_path);
                        removeFile(new_location);
                    }
                    else {

                        fields['bannerUrl'] = 'uploads/img/'+file_name;

                        queryHandler.createNotification(fields, function (err, queryResult) {

                            if (err) {
                                console.error("Error saving to DB", err);
                                response.end('Error saving to DB ', err);
                            }
                            else {
                                console.info("Save Successfull !!!"+queryResult);
                                //response.render(__dirname + '/../views/informative');
                                response.redirect('/informative')
                                //response.end(JSON.stringify({'status_code': 200, 'message': queryResult}))
                            }

                            removeFile(temp_path);
                        });
                    }

                });
            }

        });

        form.parse(request);
    }





function fetchUserInfo(request,response) {

    var requestTime = new Date().getTime();
    var userId1 = request.body.userid1;
    var userId2 = request.body.userid2;
  //  logger.info('userId1 : ',userId1 ,' userId2 : ',userId2);

    if (!userId1 ||!userId2) {
        response.send({
            'status': 403,
            'message': 'Invalid data received',
            'data': null
        });
        response.end();
    }
    else {

       queryHandler.fetchUserInfo(userId1, userId2, function (err, queryResult) {
            if (err) {
                console.error("Error fetching records : ", err);
                response.send({'status': 500, 'message': "Internal server error."});
                response.end();
            }
            else {
                if (!queryResult) {
                    console.info("Requested user : %s not found ",userId2);
                    response.send({
                        'status': 404,
                        'message': 'Requested user not found',
                        'data': queryResult
                    });
                    response.end();
                }
                else {
                    response.send({'status': 200, 'message': 'successfull', 'data': queryResult});
                    response.end();
                    logger.info("Response successfully sent for player-name = %s ",queryResult.PlayerName);
                }
            }
            var responseTime = new Date().getTime() - requestTime ;
            logger.info("RESPONSE TIME FOR REQUEST /fetchUserInfo : ",responseTime, " ms.");
        });
    }
}
module.exports.fetchUserInfo = fetchUserInfo;



function fetchUserPrivacySettings(request,response) {

    var requestTime = new Date().getTime();

    var userId = request.body.userid;

    console.log('userId',userId );
    response.type('application/json');

    if ((userId === undefined || userId == null) ) {
        response.end(JSON.stringify({
            'status': 403,
            'message': 'Invalid data received',
            'data': null
        }));
    }
    else {
        queryHandler.fetchUserPrivacySettings(userId,  function (err, queryResult) {

            response.type('application/json');
            if (err) {
                console.error("Error fetching records : ", err);
                response.end(JSON.stringify({'status': 500, 'message': "Internal server error.\n"}));
            }
            else {
                console.info("Response successfully sent  : \n", queryResult, "\n\n");
                if (queryResult == null) {

                    response.end(JSON.stringify({
                        'status': 404,
                        'message': 'User requested for is not found',
                        'data': queryResult
                    }));
                }
                else {

                    response.end(JSON.stringify({'status': 200, 'message': 'successfull', 'data': queryResult}));
                }

            }

            var responseTime = new Date().getTime() - requestTime ;
            logger.info("RESPONSE TIME FOR REQUEST /fetchUserPrivacySettings : ",responseTime, " ms.");

        });

    }
}
module.exports.fetchUserPrivacySettings = fetchUserPrivacySettings;



// fetch random users on pocketplay those who aren't friends of user

function fetchRandomFriendsInfo(request,response) {

    var requestTime = new Date().getTime();

    var userId = request.body.userid;
    var searchText = request.body.searchText;
    var timeStamp = request.body.timeStamp;

    logger.info('UserId ',userId,' requested with searchText : ',searchText );
    response.type('application/json');

    if ((userId === undefined || userId == null) || (searchText === undefined || searchText == null || searchText=='') ) {
        response.end(JSON.stringify({
            'status': 403,
            'message': 'Invalid data received',
            'data': null
        }));
    }
    else {
        queryHandler.fetchRandomFriendsInfo(userId, searchText,timeStamp, function (err, queryResult) {

            response.type('application/json');
            if (err) {
                console.error("Error fetching records : ", err);
                response.end(JSON.stringify({'status': 500, 'message': "Internal server error.\n"}));
            }
            else {
               // console.info("Response successfully sent  : \n", queryResult, "\n\n");
                if (queryResult == null) {

                    response.end(JSON.stringify({
                        'status': 404,
                        'message': 'User requested for is not found',
                        'data': queryResult
                    }));
                }
                else {

                    response.end(JSON.stringify({'status': 200, 'message': 'successfull', 'data': queryResult}));
                }
            }

            var responseTime = new Date().getTime() - requestTime ;
            logger.info("RESPONSE TIME FOR REQUEST /fetchRandomFriendsInfo : ",responseTime, " ms.");
        });

    }
}
module.exports.fetchRandomFriendsInfo = fetchRandomFriendsInfo;




//****************  Helper functions *****************

function removeFile(filepath) {
    console.info("......Removing temporary file at ", filepath);

    fse.ensureFile(filepath, function (err) {
        if (err) {
            console.info("No temp file exist...");
            return;
        }
        else {
            fse.remove(filepath, function (err) {
                if (err)
                    return console.error(err);
                else
                    return console.log('Temporary file removed successfully !')
            });
        }

    });
}


function uploadFile(){

    fse.copy(temp_path, new_location, function (err) {
        if (err) {
            console.error(err);
            return;
        }

        removeFile(temp_path);
    });
}


