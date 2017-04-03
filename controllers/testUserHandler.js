/**
 * Created by harihar on 02/05/16.
 */

var logger = require('../logger/logger.js').getLogger('testUserHandler');
var testUser = require('../database/models/testUser.js');
var formidable = require('formidable');
var path = require('path');


function saveTestUser(request , cb) {


    processIncomingFormData(request,function(err,formData) {

        testUser.findOne({device_udid :formData.device_udid},function (err, queryResult) {

            if (err)
                cb(err, null);
            else {

                if (queryResult == null) {

                    var newUser = createNewUser(formData);
                    console.log("\nCompiled test_user data to be saved  : ", newUser);
                    newUser.save(function (err, queryResult) {
                        if (err)
                            cb(err, null);
                        else {
                            console.log("Test_user data saved !!!", queryResult);
                            cb(null, 'success:Test user created');
                        }
                    });
                }
                else {
                    //user with same udid exists
                    cb(null, 'Failure:Test user already exists !!!');
                }
            }
        });
    });




}

module.exports.saveTestUser = saveTestUser;


function  processIncomingFormData(request,cb) {

    var form = new formidable.IncomingForm();
    var fields = {};

    form.on('aborted', function (err) {
        logger.error("Test user form submission ABORTED by user");
        cb(err,null);
    });

    form.on('error', function (err) {
        console.error("Error processing test user incoming form", err);
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
        //console.log('\nIncoming form fields == >\n ', fields);
        cb(null,fields);

    });

    form.parse(request);

}


function createNewUser(formData ) {

    // create new test user data object

    var userObj = new testUser();

    if (formData.test_user_name)
        userObj.name = formData.test_user_name;
    if (formData.phone)
        userObj.phone = formData.phone;
    if (formData.device_udid)
        userObj.device_udid = formData.device_udid;
    if (formData.device_os)
        userObj.device_os = formData.device_os;
    if (formData.is_enabled)
        userObj.is_enabled = formData.is_enabled;

    return userObj;

}


function getTestUsers(cb) {
    logger.info("About to fetch test users");

    testUser.find({},function (err, queryResult) {
        if (err)
            cb(err, null);
        else {
            logger.info("Test users found !!!", queryResult);
            cb(null, {"testusers": undefined});
        }
    });
}

module.exports.getTestUsers = getTestUsers;



function deleteTestUser(request,cb) {

    var device_id = request.body.device_udid;

    testUser.remove({device_udid: device_id}, function (err, done) {
        if (err) {
            logger.info("Error deleting test user ",err);
            cb(err, {'status': 500});
        }
        else {
            logger.info("Test user deleted successfully.");
            cb(null, {'status': 200});
        }
    });
}
module.exports.deleteTestUser = deleteTestUser;


function updateTestUser(request,cb) {

    var device_id = request.body.device_udid;
    var newState = request.body.is_enabled;
    logger.info("UPDATING value for userid ",device_id,' setting is_enabled to : ',newState);

    testUser.update({device_udid: device_id},{$set:{is_enabled : newState}} ,function (err, done) {
        if (err) {
            cb(err, {'status': 500});
        }
        else {
            logger.info('Test user successfully updated.');
            cb(null, {'status': 200});
        }
    });
}
module.exports.updateTestUser = updateTestUser;





