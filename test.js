

var request = require('request');

var Promise = require("bluebird");
Promise.config({
    longStackTraces: true
})

var fs = require('fs');
var readStream = Promise.promisify(uploadGameFiles);


var files = [];

files = ['GameIcon.png', 'GameBanner.jpg', 'GameIcon_Square.png','GameResources.zip'].map(function(name) {
    return readStream('imzucdca', name);
})


Promise.all(files)
    .then(function(result) {
    console.log("All the files were created",result);
    })
    .catch(function(err){
        console.error("Error : ",err);
    });



function uploadGameFiles(gameid, filename, cb) {
    var sourceURL = 'http://192.168.1.10:8000/games/' + gameid.toString() + '/' + filename;
    var destURL = 'http://192.168.1.10:8000/games/temp/' + gameid.toString() + '/' + filename;

    var localPath = 'uploads/games/' + gameid + '/temp2/' + filename;
    var r = request(sourceURL);

    r.on('response', function (res) {

        var st = fs.createWriteStream(localPath);
        st.on('error', cb);
        r.pipe(st);


        res.on('end', function () {
            cb(null, destURL);
        });

        res.on('error', cb)
    });

    r.on('error', cb);
}