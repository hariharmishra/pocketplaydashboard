/**
 * Created by Nikhil on 28/05/16.
 */


var envConfig = require('./config/constants.js');
var request = require('request');

var loopCount  = 5000 ;

var options = {};
options.json = true;
options.method = 'POST';

if(envConfig.CURRENT_SERVER_ENV === envConfig.SERVER_ENV_TYPE.QA_PROD || envConfig.CURRENT_SERVER_ENV === envConfig.SERVER_ENV_TYPE.QA_DEV ){
    options.url = "http://52.86.35.40:8000/fetchUserInfo";      // QA URL
}else if(envConfig.CURRENT_SERVER_ENV === envConfig.SERVER_ENV_TYPE.LIVE_PROD || envConfig.CURRENT_SERVER_ENV === envConfig.SERVER_ENV_TYPE.LIVE_DEV ){
    options.url = "http://52.77.75.48:8000/fetchUserInfo";     // LIVE URL
}

var successCount = 0;
var dummyUsers = [];

if(envConfig.CURRENT_SERVER_ENV === envConfig.SERVER_ENV_TYPE.LIVE_PROD || envConfig.CURRENT_SERVER_ENV === envConfig.SERVER_ENV_TYPE.LIVE_DEV ){
    dummyUsers = ["573af89849bd48c8450e8383","573af8cc49bd48c8450e83a2","573af8cd49bd48c8450e83c1","573afd2d6a40495247ab5926","573b00f26a40495247ab5c8c","573af8ce49bd48c8450e84a9"];

}else if(envConfig.CURRENT_SERVER_ENV === envConfig.SERVER_ENV_TYPE.QA_DEV || envConfig.CURRENT_SERVER_ENV === envConfig.SERVER_ENV_TYPE.QA_PROD ){
    dummyUsers = ["57459a68992b84545439c6d3","5745a3e0d666de2955a035df","57459f2f992b84545439d2db","5745a3e0d666de2955a035df","57467daa42e10d9355d42f48","5747d1ee42e10d9355d614b3"];
}


var postToURL = function postToURL() {
    options.body = getRandomRequestPacket();
    console.log(options.body);
    request(options.url , options, function (error, response) {
        if (error) {
            console.log("Error : ", error);
        }
        else {
            console.log("Success", response.statusCode);
            successCount++;
        }
    });
}

exports.postToURL = postToURL;

function getRandomRequestPacket(){
    return {
        "userid1" : dummyUsers[ Math.floor((Math.random() * dummyUsers.length))],
        "userid2" : dummyUsers[ Math.floor((Math.random() * dummyUsers.length))]
    };
}


function loopRequest(){
    for(var i=0;i<loopCount ;i++){
        postToURL();
    }
}


loopRequest();