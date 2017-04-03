/**
 * Created by harihar on 18/03/16.
 */



var gamesQueryHandler = require('../controllers/gamesQueryHandler');
var fse = require('fs-extra');
var logger = require('../logger/logger.js').getLogger('gamesController');
var formidable = require('formidable');
var path = require('path');




function getAllGames(cb){
    gamesQueryHandler.getAllVersionFromDb(function(err,gameV){
        //console.log('current all games version : ',gameV);
        gamesQueryHandler.getAllGamesFromDb(function(err,games){
            logger.info("Games list successfully sent ");
            //console.log('Games List : ',JSON.stringify(games));
            cb(null,{gamedetails : games,gameV: gameV });

        })
  })

}
module.exports.getAllGames = getAllGames ;

function getGameDetails(request,cb) {

    var gameid = request.params.gameid;
   // console.log('gameid', gameid);

    if (gameid == 'newgame') {
        gamesQueryHandler.getNewGameId(function (game_id) {
            logger.info('new game id created = ', game_id);
            var game_details = {};
            var game_mode = {};
            var difficulty_mode = {};
            game_details.game_mode = game_mode;
            game_details.difficulty_mode = difficulty_mode;
            game_details._id = game_id;

            var obj = {
                game_details: game_details,
                existsGameResources: null,
                existsGameResourcesAll: null
            }

            cb(null, obj);
        });
    }
    else {

        gamesQueryHandler.getGameFromDb(gameid, function (err, data) {
            if (err)
                cb(new Error(gameid + " details do not exist !!!"), null);
            else {
                var game_details = data;
              //  console.log('game_details---->', game_details);

                if (game_details) {

                    var obj = {
                        game_details: game_details,
                        existsGameResources: null,
                        existsGameResourcesAll: null
                    }

                    cb(null, obj);
                }
                else {
                    var game_details = {};
                    game_details._id = gameid;
                    var game_mode = {};
                    game_details.game_mode = game_mode;
                    var difficulty_mode ={};
                    game_details.difficulty_mode = difficulty_mode;
                     var obj = {
                        game_details: game_details,
                        existsGameResources: null,
                        existsGameResourcesAll: null
                    }

                    cb(null, obj);
                }
            }
        });
    }

}
module.exports.getGameDetails = getGameDetails ;

function getPublishedGameDetails(request,cb) {
    var gameid = request.params.gameid;
    logger.info('Getting published game details for gameid', gameid);

    gamesQueryHandler.getPublishedGameFromDb(gameid, function (err, data) {
        if (err)
            cb(new Error(gameid + " details do not exist !!!"), null);
        else {
            if (data)
                logger.info("Published game_details found");
            else
                logger.info('Published game_details not found.');
            var game_details = data;

            var obj = {
                game_details: game_details,
                existsGameResources: null,
                existsGameResourcesAll: null
            };

            cb(null, obj);

        }
    });
}
module.exports.getPublishedGameDetails = getPublishedGameDetails;

function upload_resources(request ,cb){

    var form = new formidable.IncomingForm();
    var newFileName, gameId,uploadedAssetType,qa_status;

    var uploadPath = path.join(path.resolve(__dirname + '/../uploads/games/'), '/');
    logger.info('Game Asset Upload Path ', uploadPath);
    form.uploadDir = uploadPath;

    form.parse(request , function(err, fields, files) {
        if(fields){
            gameId = fields.game_id;
            newFileName = fields.file_name;
            uploadedAssetType = fields.uploaded_asset_type ;
            qa_status = fields.qa_status;
        }
    });
    form.on('end', function(fields, files) {
        var temp_path = this.openedFiles[0].path;
        var file_name = this.openedFiles[0].name;
        var new_location =  'uploads/games/' +gameId+'/temp/';

        if(newFileName == null)
            newFileName = file_name;

        var options ={};
        options.clobber = true; // overwrites the file , if exists

        fse.copy(temp_path, new_location + "/" +newFileName,options, function(err) {
            if (err) {
                logger.error(err);
                cb(err,null);
            } else {
                logger.info("success!");
                removeFile(temp_path);
                /*
                1.  ZIP
                2.	LUA-ALL
                3.	Banner
                4.	Icon
                5.	Square Icon
                6.  Text Fields
                */
                var formData ={};
                formData.game_id  = gameId;
                formData.uploaded_asset_type = uploadedAssetType;
                formData.qa_status = "Test";

                gamesQueryHandler.saveOrUpdateGame(formData,function(err,res){
                    if(err) {
                        cb(err, null);
                        removeFile('uploads/games/' +res._id);
                        removeFile(temp_path);
                    }
                    else
                        cb(null,res);
                });
            }
        });
    });

}
module.exports.upload_resources = upload_resources ;

function saveGameDetails(request ,cb) {

    var form = new formidable.IncomingForm();
    var fields ={};

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


    form.on('end', function () {

        fields.uploaded_asset_type = '6';

        if(!fields.hasOwnProperty('game_mode')){
            var game_mode = [];
            fields.game_mode = game_mode;
        }
        if(!fields.hasOwnProperty('difficulty_mode')){

            var difficulty_mode = [];
            fields.difficulty_mode = difficulty_mode;
        }
        //console.log('\nfields == >\n ', fields);

        gamesQueryHandler.saveOrUpdateGame(fields, function (err, res) {

            console.log(res);
            if (err) {
                cb(err, null);
                removeFile('uploads/games/' + res._id);
            }
            else {
                cb(null, res);
            }
        });


    });

    form.parse(request);

}
module.exports.saveGameDetails = saveGameDetails ;

function deleteGameDetails(request ,cb) {

    var gameid = request.params.gameid ;
        gamesQueryHandler.deleteGame(gameid, function (err, res) {
            if (err) {
                logger.info(err);
                cb(err, null);
            }
            else {

                try {
                    fse.removeSync('uploads/games/' + gameid);
                    logger.info('success');
                    cb(null,'success');
                }
                catch(err){
                    logger.error(err);
                    cb(err,null);
                }

            }
        });

}
module.exports.deleteGameDetails = deleteGameDetails ;

function pushQAGameToLive(request,cb){

    getPublishedGameDetails(request,function(err,data){
        if (err)
            cb(new Error("Game details do not exist !!!"), null);
        else {
            var game_details = data;
          //  logger.info('published game_details => ', game_details);

            cb(null, game_details);

        }
    })
}
module.exports.pushQAGameToLive = pushQAGameToLive;


// Functions of LIVE SERVER

function live_SaveORUpdateGameToStaging(gameobj ,cb) {

    var gameObj = gameobj.game_details;
    //console.log('Game Object', gameObj);
    gamesQueryHandler.live_SaveORUpdateGameToStaging(gameObj, function (err, res) {
        if (err) {
            cb(err, {'gameid': gameObj._id});
        }
        else {
            cb(null, {'gameid': gameObj._id});
        }
    });
}
module.exports.live_SaveORUpdateGameToStaging = live_SaveORUpdateGameToStaging ;


function live_saveGameDetails(request ,cb) {

    var form = new formidable.IncomingForm();
    var fields ={};

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


    form.on('end', function () {


       // console.log('\nfields == >\n ', fields);

        gamesQueryHandler.live_saveOrUpdateGame(fields, function (err, res) {

            //console.log(res);
            if (err) {
                cb(err, null);

            }
            else {
                cb(null, res);
            }
        });


    });

    form.parse(request);

}
module.exports.live_saveGameDetails = live_saveGameDetails ;


var updatePushToLiveStatus = function (gameid,status,cb){

    gamesQueryHandler.updatePushToLiveStatus(gameid,status,function(err,result){
        if(err){
            cb(err,null);
        }else {
            cb(null, result);
        }
    });
};
module.exports.updatePushToLiveStatus= updatePushToLiveStatus;


// Helper functions


function removeFile(filepath) {
    logger.info("......Removing file at ", filepath);

    fse.ensureFile(filepath, function (err) {
        if (err) {
            logger.error("No file exist...");
            return;
        }
        else {
            fse.remove(filepath, function (err) {
                if (err)
                    return console.error(err);
                else
                    return console.log('File removed successfully !')
            });
        }

    });
}