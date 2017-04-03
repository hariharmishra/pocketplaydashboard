/**
 * Created by harihar on 02/06/16.
 */

var AWS = require('aws-sdk');
var awsS3Config = require('../config/awsS3Config');
var logger = require('../logger/logger.js').getLogger('awsController');
var fs = require('fs');

var accessKeyId =  awsS3Config.access_key_id;
var secretAccessKey = awsS3Config.secret_access_key;
var region = awsS3Config.region;

AWS.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region : region
});

var s3 = new AWS.S3();

//app.post('/upload', function(req, res){

var path = __dirname + '/../uploads/face1.jpg';
fs.readFile(path, function(err, file_buffer){
console.log(err,file_buffer.length);
    var params = {
        Bucket: 'ppimgtestbucket',
        Key: 'upload/face1.jpg',
        Body: file_buffer
    };

    s3.putObject(params, function (perr, pres) {
        if (perr) {
            console.log("Error uploading data: ", perr);
        } else {
            console.log("Successfully uploaded image ",pres);
        }
    });
});