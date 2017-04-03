
var user = require('../database/models/userSchema');
var push = require('../lib/push/index');


function setCustomTimeOut(rawData){

   console.log("data received --- > ",rawData );

    var deltaTime =  new Date(rawData.startDate).getTime() - new Date().getTime();
   // console.log(deltaTime);
   if(deltaTime > 0) {

        console.info("Push : " + rawData._id + " having Title = " + rawData.title + "  scheduled at "+new Date(rawData.startDate) );
        setTimeout(function () {
        //    initPush()
        }, deltaTime);
    }



}
module.exports.setCustomTimeout = setCustomTimeOut;

function getUsersDeviceInfo(cb){

    user.find({},{device_info:1}, function(err, queryOutput){
        if (err) {
            console.error("Unable to fetch users from db ", err);
            cb(err,null);
        }
        else {
            console.info("\nusers List :\n " ,queryOutput);
            cb(null,queryOutput);
        }
    });
}
module.exports.getUsersDeviceInfo = getUsersDeviceInfo;