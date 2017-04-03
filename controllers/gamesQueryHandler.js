/**
 * Created by harihar on 18/03/16.
 */


var Game = require('../database/models/game');
var StagingGame = require('../database/models/staginggame');
var gamesVersion = require('../database/models/gameVersion');
var httpCallsHandler =  require('../controllers/httpCallsHandler');
var httpCallsConfig = require('../config/httpCallsConfiguration.js');
var constants = require('../config/constants.js');
var request = require('request');
var Promise = require("bluebird");
var fse = require('fs-extra');
var path = require('path');
var logger = require('../logger/logger.js').getLogger('gamesQueryHandler');
var games;
var commonGameParams={};
var gamesJson = null;
var staginggame;

var readStream = Promise.promisify(uploadGameFiles);



//var userHandler = require("./userHandler.js");

exports.initGameManager = function (callback) {
    logger.info("INITING GAME MANAGER");
    getGamesFile(doWithGames);

    function doWithGames(err, gamesJson2) {
        if (err) {
            logger.info("ERROR GETTING GAMES LIST");
            if (!gamesJson) {
                logger.err("GAMES SERVER IS DOWN. EXITING...");
                process.exit(1);
            } else {
                logger.err("GAMES SERVER IS DOWN. CONTINUING WITH THE OLD LIST OF GAMES");
                callback();
            }
        } else {
            var gamesObject = null;
            try {
                gamesObject = strUtils.getJsonObject(gamesJson2);
            } catch (e) {
                logger.info("ERROR WHILE PARSING NEW GAMES FILE ");
                console.log(e);
                callback(e);
            }
            var toUpdateClients = false;
            if(gamesObject) {
                gamesJson = gamesJson2;
                logger.info("GAME VERSION FILE: " + gamesObject.Version);
                games = {};
                var requested = gamesObject.GamesInfo.length;
                logger.info("REQUESTED GAMES IN JSON: "+requested);
                var completed = 0;
                fillUpCommonGameVariables(gamesObject);
                for (var i in gamesObject.GamesInfo) {
                    // new changes for movement from file to DB
                    var game = gamesObject.GamesInfo[i];
                    games[game._id] = game;
                    // end
                    /*var gameObj = gamesObject.GamesInfo[i];
                     saveOrUpdateGame(gameObj, function (err, game) {
                     completed++;
                     if (err) {
                     logger.err("ERROR UPATING GAME: " + strUtils.convertToString(gameObj));
                     } else {
                     logger.info("ADDING GAME: "+game._id);
                     games[game._id] = game;
                     }
                     if (completed == requested) {
                     logger.info("NUM OF GAMES: " + arrUtils.arraySize(games));
                     //logger.info(" CURRENT GAMES MAP: " + strUtils.convertToString(games)+" SIZE: "+Object.keys(games).length);

                     if(gamesVersion!=gamesObject.Version && gamesVersion)
                     {
                     //this is an update
                     gamesVersion=gamesObject.Version;
                     toUpdateClients=true;
                     }else if (gamesVersion!=gamesObject.Version && !gamesVersion){
                     //this is first time
                     gamesVersion=gamesObject.Version;
                     }else{
                     //same version
                     }
                     logger.info("callback called");
                     callback(null,toUpdateClients,gamesObject);
                     }
                     });*/

                }
                callback(null,false,gamesObject);
            }else{
                if (!gamesJson) {
                    logger.err("ERROR PARSING GAMES FILE. EXITING...");
                    process.exit(1);
                } else {
                    logger.err("ERROR PARSING NEW GAMES FILE. CONTINUING WITH THE OLD LIST OF GAMES");
                    callback();
                }
            }

        }
    }
}

function fillUpCommonGameVariables(gamesObject){
    commonGameParams.version = gamesObject.Version;
    commonGameParams.isRCAvailable = gamesObject.IsRCAvailable;
    commonGameParams.IsSciptDownloadable = gamesObject.IsSciptDownloadable;
    logger.info("COMMON GAME PARAMS: "+ strUtils.convertToString(commonGameParams));
}

function createGameModel(formData, gameObj) {

    if(gameObj instanceof StagingGame && gameObj){
        var game = gameObj;
    }
    else if(gameObj instanceof Game){
        var game = new StagingGame(gameObj.toJSON());
    }
    else{
        var game = new StagingGame();
    }

    if (formData.game_id )
        game._id = formData.game_id;

    if(formData.display_name)
        game.display_name = formData.display_name ;


    if (formData.min_players )
        game.min_players = formData.min_players ;

    if (formData.max_players )
        game.max_players = formData.max_players ;

    if (formData.lua_file_name )
        game.lua_file_name = formData.lua_file_name;

    if (formData.is_active )
        game.is_active = formData.is_active ;

    if (formData.coins_to_unlock )
        game.coins_to_unlock = formData.coins_to_unlock ;

    if (formData.category)
        game.category = ['None', 'Turn Based', 'Challenge Based', 'Casual Mode'].indexOf(formData.category);

    if (formData.display)
        game.display = ['None', 'Cards', 'Turn Board', 'Dice' ,'Challenge'].indexOf(formData.display);

    if (formData.orientation != undefined)
        game.orientation = formData.orientation;

    if(formData.game_mode && formData.game_mode.length>0) {
        var game_mode = {};

        game_mode.random = formData.game_mode.indexOf('random') > -1 ? true : false;
        game_mode.pass_and_play = formData.game_mode.indexOf('pass_and_play') > -1 ? true : false;
        game_mode.friends = formData.game_mode.indexOf('friends') > -1 ? true : false;
        game_mode.bot = formData.game_mode.indexOf('bot') > -1 ? true : false;

        game.game_mode = game_mode;
    }

    if(formData.difficulty_mode && formData.difficulty_mode.length >0) {
        var difficulty_mode = {};

        difficulty_mode.easy = formData.difficulty_mode.indexOf('easy') > -1 ? true : false;
        difficulty_mode.medium = formData.difficulty_mode.indexOf('medium') > -1 ? true : false;
        difficulty_mode.hard = formData.difficulty_mode.indexOf('hard') > -1 ? true : false;

        game.difficulty_mode = difficulty_mode;
    }

    if(formData.qa_status !=undefined)
        game.qa_status = formData.qa_status;

    if(formData.bet_amount) {
        game.bet_amount = formData.bet_amount.split(",");
    }

    if(formData.random_turn_time )
        game.random_turn_time = formData.random_turn_time;

    if(formData.friendly_table_timer )
        game.friendly_table_timer = formData.friendly_table_timer;

    if(formData.friendly_bonus_table_time)
        game.friendly_bonus_table_time = formData.friendly_bonus_table_time;

    game.update_time = new Date();
    return game;
}

function saveOrUpdateGame(formData, cb) {
   // console.log('formData-----', formData);
    /*
     1.  ZIP
     2.	LUA-ALL
     3.	Banner
     4.	Icon
     5.	Square Icon
     6.  Text Fields
     */

    var publishedGameVersion;


    //Get current game version
    getPublishedGameVersion(formData.game_id, function (err, result) {
        if (err) {
            logger.error("error in finding published game ",err);
        }
        else {
            publishedGameVersion = result;
            console.log('publishedGameVersion',publishedGameVersion);

            StagingGame.findOne({_id: formData.game_id}, function (err, res) {
                if (err) {
                    console.log(err);
                    cb(err, null);
                }

                //check if its published game or not

                Game.findOne({_id: formData.game_id}, function (err, lastPublishedGame) {
                    if (err) {
                        console.log(err);
                        cb(err, null);
                    }
                    else{

                        if(lastPublishedGame && res == null){
                            staginggame = createGameModel(formData, lastPublishedGame);
                        }
                        else{
                            staginggame = createGameModel(formData, res);
                        }

                        if (res == null) {
                            // No game found with received gameid , save this new game
                    //        console.log("About to save game ....");
                            var version;
                            if(lastPublishedGame)
                                version = lastPublishedGame.version;
                            else
                                version = '0.0|0.0|0.0|0.0|0.0|0.0';

                            staginggame.version = version;

                            setStagingVersionFlags(formData.uploaded_asset_type);

                            staginggame.save(function (err, res) {
                                if (err) {
                                    logger.error(err);
                                    cb(err, null);
                                } else {
                                    logger.info("game successfully saved to db ", res);
                                    cb(null, staginggame);
                                }
                            });
                        }
                        else {


                            staginggame.is_game_resources_modified = res.is_game_resources_modified;
                            staginggame.is_game_resources_all_modified = res.is_game_resources_all_modified;
                            staginggame.is_game_icon_modified = res.is_game_icon_modified;
                            staginggame.is_game_icon_square_modified = res.is_game_icon_square_modified;
                            staginggame.is_game_banner_modified = res.is_game_banner_modified;
                            staginggame.is_game_text_modified = res.is_game_text_modified;

                            setStagingVersionFlags(formData.uploaded_asset_type);



                            staginggame.save({_id: formData.game_id}, function (err, res) {
                                if (err) {
                                    logger.error("ERROR UPDATING GAME: " + formData.game_id);
                                    cb(err, null);
                                } else {
                                    logger.info("GAME UPDATING IN Staging DB: " + formData.game_id);

                                    if (formData.qa_status == 'Ready') {
                                        validateStagingGameAssets(formData.game_id, function (err, success) {

                                            if (err)
                                                cb(err, success);
                                            else {
                                                if (success == true) {
                                                    logger.info("Validation status : ", success);
                                                    copyFilesFromTempToMain(formData.game_id, function (err, res) {
                                                        if (res == 'success') {
                                                            updateChangesToDb(formData.game_id, staginggame, function (err, res) {
                                                                if (err) {
                                                                    cb(err, null);
                                                                }
                                                                else {
                                                                    if (res) {
                                                                        var dataToSend = {"requestType": httpCallsConfig.GAME_VERSIONS_UPDATED};
                                                                        httpCallsHandler.makeHttpRequest(dataToSend, 'post', function (err, done) {
                                                                            if (err) {
                                                                                logger.error('Error occurred with game version http request ', err);
                                                                            }
                                                                            else {
                                                                                logger.info('http request for game version update was successful.');
                                                                            }
                                                                        });
                                                                        cb(null, {"_id": formData.game_id,"is_published": true});
                                                                    }
                                                                    else
                                                                        cb(null, null);
                                                                }
                                                            });
                                                        }
                                                        else {
                                                            logger.error('Error copying files...');
                                                        }
                                                    })
                                                }
                                                else {
                                                    StagingGame.findOne({_id: formData.game_id}, function (err, res) {
                                                        if (err)
                                                            logger.error(err);
                                                        else {
                                                            res.qa_status = "Test";
                                                            res.save(function (err, res) {
                                                                if (!err)
                                                                    cb(null, {
                                                                        "asset_validation": false,
                                                                        "_id": formData.game_id
                                                                    });
                                                            })
                                                        }
                                                    });
                                                }
                                            }

                                        });
                                    } else {

                                        cb(null, {"_id": formData.game_id});
                                    }
                                }
                            });
                        }
                    }

                })


            });
        }
    });
}
exports.saveOrUpdateGame = saveOrUpdateGame;

function setStagingVersionFlags(assetType){
    switch (assetType) {
        case '1':
        {
            staginggame.is_game_resources_modified = true;
        }
            break;
        case '2':
        {
            staginggame.is_game_resources_all_modified = true;
        }
            break;
        case '3':
        {
            staginggame.is_game_banner_modified = true;
        }
            break;
        case '4':
        {
            staginggame.is_game_icon_modified = true;
        }
            break;
        case '5':
        {
            staginggame.is_game_icon_square_modified = true;
        }
            break;
        case '6':
        {
            staginggame.is_game_text_modified = true;
        }
            break;
    }
}

function updateVersion(){

    var splitStringArray = staginggame.version.split('|');

    var resources = splitStringArray[0];
    var resourcesAll = splitStringArray[1];
    var banner = splitStringArray[2];
    var icon = splitStringArray[3];
    var squareIcon = splitStringArray[4];
    var textualData = splitStringArray[5];


    if(staginggame.is_game_resources_modified) { resources  = (+(resources) + +(1.0)).toFixed(1); }
    if(staginggame.is_game_resources_all_modified){resourcesAll = (+(resourcesAll) + +(1.0)).toFixed(1);}
    if(staginggame.is_game_banner_modified){banner = (+(banner) + +(1.0)).toFixed(1);}
    if(staginggame.is_game_icon_modified){icon = (+(icon) + +(1.0)).toFixed(1);}
    if(staginggame.is_game_icon_square_modified){squareIcon = (+(squareIcon) + +(1.0)).toFixed(1);}
    if(staginggame.is_game_text_modified){textualData = (+(textualData) + +(1.0)).toFixed(1);}



    var finalVersion = resources+ '|' +resourcesAll +'|' + banner + '|' + icon + '|' + squareIcon +'|' + textualData;

    console.log('\n\n\n!!!!!!!!  Final Game version ---------> ', finalVersion ,'\n\n\n');
    staginggame.version = finalVersion;
}

function updateChangesToDb(game_id,gameobj, cb) {
    console.log("Version received for updating in game  === > ",gameobj.version ,"for gameid -> ",game_id);
    updateVersion();
    StagingGame.findOne({_id: game_id}, function (err, game) {
        // Check if game already exists in Game collection.

        Game.findOne({_id: game_id}, function (err, res) {
            if (err) {
                console.error('Unable to find staging game document', err);
                cb(err, null);
            }
            else {
                if (res == null) {
                    // Save Game

                    var gameObj = new Game(game.toJSON());
                    gameObj.version = staginggame.version;
                    gameObj.is_pushed_to_live = false;
                   // console.log("gameObj === > ",JSON.stringify( gameObj));
                    gameObj.save(function (err, res) {
                        if (err) {
                            console.error('Error saving Game document', err);
                            cb(err, null);
                        }
                        else {
                            console.log('Game successfully saved to Game collection');
                            // removing game from staginggame collection
                            removeStagingAndUpdateAllGamesVersion(game_id, function (err, res) {
                                cb(err, res);
                            });
                        }
                    });
                }
                else {
                    // Update Game
                    var gameObj = new Game(game.toJSON());
                    gameObj.version = staginggame.version;
                    gameObj.is_pushed_to_live = false;
                    //gameObj.version = gameobj.version;
                    Game.update({_id: game_id}, gameObj, function (err, res) {
                        if (err) {
                            console.error('Error updating Game document', err);
                            cb(err, null);
                        }
                        else {
                            console.log('Game successfully updated to Game collection.');
                            // removing game from staginggame collection
                            removeStagingAndUpdateAllGamesVersion(game_id, function (err, res) {
                                cb(err, res);
                            });
                        }
                    });
                }
            }
        });
    });
}

function  getPublishedGameVersion(gameid,cb){

    Game.findOne({_id:gameid},{version:1},function(err,result){
        if(err){
            console.log("Error fetching gameversion from games...",err);
            cb(err,null);
        }else{
            if(result){
                console.log("Published version of game",result.version);
                cb(null,result);
            }
            else
                cb(null,null);
        }

    });
}

function removeStagingAndUpdateAllGamesVersion(game_id, cb){
    StagingGame.remove({_id: game_id}, function(err, res){
        if(!err)
        {
            console.log("\n!!!Game with id : ", game_id ," successfully removed from staging games collection !!!\n");
            gamesVersion.findOne({}, function(err, gameV){
                gameV.Version = parseInt(gameV.Version) + 1;
                gameV.save(function(err, success){
                    if(err){
                        cb(err, null);
                    }
                    else{
                        console.log('Successfully removed Staging And Updated All GamesVersion');
                        cb(null, {"_id": game_id});
                    }
                });
            });

        }
        else{
            cb(err,null);
        }

    })
}

function getGamesFile(callback) {
    getAllGamesFromDb(function(err, games){
        var GamesInfo = [];
        if(games){
            for(i in games){
                GamesInfo.push(games[i]);
            }
            getAllVersionFromDb(function(err, data){
                var object = {
                    "Version": data.Version,
                    "IsRCAvailable":data.IsRCAvailable,
                    "IsSciptDownloadable" : data.IsSciptDownloadable,
                    "BasePath":data.BasePath,
                    "GamesInfo":GamesInfo
                };
                callback(err, JSON.stringify(object));
            })
        }
        else{
            logger.info("No Games found in DB");
        }
    });
}
exports.getGamesFile = getGamesFile;

exports.getGamesObject = function () {
    return JSON.parse(gamesJson);
}

function getGame(gameId) {
    return games[gameId];
}
exports.getGame = getGame;

function isGameValid(gameId) {
    return games[gameId] == null ? false : true;
}
exports.isGameValid = isGameValid;

exports.getAllGames=function(){
    return games;
}

exports.getCommonParams=function(){
    return commonGameParams;
}
exports.commonGameParams =commonGameParams;

exports.get_locked_games = function(Count) {
    var game_version = JSON.parse(gamesJson).GamesInfo;
    var LockedGames = [];
    for (var i = 0; i < game_version.length ; i++)
    {
        if (game_version[i].IsLocked == true && Count >= game_version[i].ToUnlock)
        {
            LockedGames.push({game_id: game_version[i].GameId, is_lock : false });
        }
    }
    console.log('LockedGames', LockedGames);
    return LockedGames;
};


exports.purchasedGames = function(user, data,cb){
    var toPush = true;
    if(!data.game_id || !data.purchase_token || !data.access_token || !data.product_id){
        return cb('Data Invalid', false);
    }
    else{
        userHandler.getUser(user._id,true,function(err,user,done) {
            if(user.purchased_game && user.purchased_game.length > 0){
                for(var i =0 ;i <user.purchased_game.length;i++){
                    if(user.purchased_game[i].game_id.toString() == data.game_id.toString()){
                        toPush = false;
                    }
                }
            }
            if(toPush == true){
                user.purchased_game.push(data);
            }

            userHandler.updateUser(user, done, function (err) {
                if (err) {
                    logger.err(err);
                    logger.info("ERROR SAVING USER CONTACTS");
                }
                return cb(null, true);
            });
        });
    }
};


function getPublishedGameFromDb(gameid, cb) {

    Game.findOne({_id: gameid}, function (err, gamedetails) {
        if (err) {
            cb(err, null);
        }
        else {
            if (gamedetails) {
                console.log("Game from db  ==== > ", gamedetails);
                cb(null, gamedetails);
            }
            else
                cb(null, null);

        }
    });
}
exports.getPublishedGameFromDb = getPublishedGameFromDb;



function getGameFromDb(gameid, cb){

    StagingGame.findOne({_id: gameid } , function (err, gamedetails) {
        if(err){
            cb(err, null);
        }
        else {
            if (gamedetails == null) {
                console.log("Game not available in staging game collections.checking in main game collection")
                Game.findOne({_id: gameid},function(err,gamedetails){
                    if(err) {
                        cb(err, null);
                    }
                    else
                    {
                        if(gamedetails){
                            console.log("Game from db  ==== > ", gamedetails);
                            cb(null, gamedetails);
                        }
                        else
                            cb(null, null);

                    }
                });

            } else {
                console.log("Game from db  ==== > ", gamedetails);
                cb(null, gamedetails);
            }
        }
    })
}
exports.getGameFromDb = getGameFromDb;


function getAllGamesFromDb(cb){

    var allGames =[];
    Game.find({}, function(err, games){
        if(err) {
            console.log(err);
            cb(err,null);
        }
        else {
          //  console.log('publishedGames',JSON.stringify(games));
            StagingGame.find({},function(err,stagingGames){
                if(err){
                    console.error('Unable to find games in staging game collection');
                    cb(err,null);
                }
                else {

                    allGames = stagingGames;
                    for(var i=0 ;i < games.length;i++){
                        var flag = 0;
                        for (var j =0 ;j < stagingGames.length ;j++){
                            if(games[i]._id == stagingGames[j]._id){
                                flag = 1;
                            }
                            else
                                flag = 0;
                        }
                        if(flag ==1) {
                            continue;
                        }
                        else {
                            allGames[allGames.length] = games[i];
                        }
                    }
                 //   console.log('allGames',JSON.stringify(allGames));
                    cb(err, allGames);
                }
            })

        }
    })
}
exports.getAllGamesFromDb = getAllGamesFromDb;


function getAllVersionFromDb(cb){
    gamesVersion.findOne({}, function(err, version){
        cb(err, version);
    })
}
exports.getAllVersionFromDb = getAllVersionFromDb;


function deleteGame(gameid,cb){
    StagingGame.findOne({_id:gameid},function(err,res){
        if(res == null){
            Game.remove({_id: gameid}, function(err, res){
                if(!err)
                {
                    console.log("\n!!!Game with id : ", gameid ," successfully removed from game database !!!\n");
                    cb(null,true);
                }
                cb(err,false);
            })
        }
        else {
            StagingGame.remove({_id: gameid}, function(err, res){
                if(!err)
                {
                    console.log("\n!!!Game with id : ", gameid ," successfully removed from staging game database !!!\n");
                    cb(null,true);
                }
                cb(err,false);
            })
        }
    })

}
exports.deleteGame = deleteGame;


function getNewGameId(cb){
    var uniqueid = new Date().getTime().toString(36);
    logger.info('New Unique Id ' ,uniqueid);
    cb(uniqueid);
}
exports.getNewGameId = getNewGameId ;

function doesFileExist(filepath ,cb){
    fse.exists(filepath , function(isFileAvailable) {
        logger.info('Is File Present  ---- > ' ,isFileAvailable );
        cb(isFileAvailable);
    });
}
exports.doesFileExist = doesFileExist;



function copyFilesFromTempToMain(gameid ,cb){

    var options ={};
    options.clobber = true; // overwrites the file , if exists


    //copy Game Icon
    fse.copy('uploads/games/'+ gameid + '/temp/GameIcon.png', 'uploads/games/'+ gameid + '/GameIcon.png'  , options,function(err) {
        if (err) {
            logger.error(err,'error copying gameicon');
            cb(err,null);
        } else {
            logger.info('Gameicon copy --> Success');
            //copy  Game Icon Square
            fse.copy('uploads/games/'+ gameid + '/temp/GameIcon_Square.png', 'uploads/games/'+ gameid + '/GameIcon_Square.png'  ,options, function(err) {
                if (err) {
                    logger.error(err, 'error copying gameiconsquare');
                    cb(err, null);
                } else {
                    logger.info('Gameiconsquare copy --> Success');
                    //copy  Game banner
                    fse.copy('uploads/games/'+ gameid + '/temp/GameBanner.jpg', 'uploads/games/'+ gameid + '/GameBanner.jpg'  ,options, function(err) {
                        if (err) {
                            logger.error(err, 'error copying gamebanner');
                            cb(err, null);
                        } else {
                            logger.info('Gamebanner copy --> Success');
                            //copy  Game resources
                            fse.copy('uploads/games/'+ gameid + '/temp/GameResources.zip', 'uploads/games/'+ gameid + '/GameResources.zip'  ,options, function(err) {
                                if (err) {
                                    logger.error(err, 'error copying GameResources');
                                    cb(err, null);
                                } else {
                                    logger.info('Gameresources copy --> Success');
                                    //copy  Game resources all
                                    fse.copy('uploads/games/'+ gameid + '/temp/GameResourcesAll.zip', 'uploads/games/'+ gameid + '/GameResourcesAll.zip'  ,options, function(err) {
                                        if (err) {
                                            logger.error(err, 'error copying GameResourcesAll');
                                            cb(err, null);
                                        } else {
                                            logger.info('Gameresourcesall copy --> Success');
                                            logger.info('\n******All Game Assets transferred from temp to main folder****\n');
                                            cb(null,'success');
                                        }
                                    });
                                }
                            });

                        }
                    });
                }
            });
        }
    });



}

function validateStagingGameAssets(game_id,cb) {
    var allAssetAvailable = false;

    doesFileExist('uploads/games/' + game_id + '/temp/GameResources.zip', function (isFileAvailable) {
        if(isFileAvailable){
            doesFileExist('uploads/games/' + game_id + '/temp/GameResourcesAll.zip', function (isFileAvailable) {
                if (isFileAvailable){
                    doesFileExist('uploads/games/' + game_id + '/temp/GameIcon_Square.png', function (isFileAvailable) {
                        if (isFileAvailable){
                            doesFileExist('uploads/games/' + game_id + '/temp/GameBanner.jpg', function (isFileAvailable) {
                                if (isFileAvailable)
                                {
                                    doesFileExist('uploads/games/' + game_id + '/temp/GameIcon.png', function (isFileAvailable) {
                                        if (isFileAvailable )
                                        {
                                            allAssetAvailable = true;

                                            logger.info("Are all assets available" ,allAssetAvailable);
                                            if (allAssetAvailable) {
                                                logger.info("All assets available in temp games folder");
                                                cb(null, true);
                                            }
                                            else {
                                                logger.error("Missing assets in temp games folder");
                                                cb(null, false);
                                            }
                                        }
                                        else
                                            cb(null, false);
                                    });
                                }
                                else
                                    cb(null, false);
                            });
                        }
                        else
                            cb(null, false);
                    });
                }
                else
                    cb(null, false);
            });
        }
        else
            cb(null, false);
    });




}



// ***********  QUERY HANDLERS FOR LIVE SERVER  *************


function live_SaveORUpdateGameToStaging(gameData,cb) {

    StagingGame.findOne({_id: gameData._id}, function (err, res) {
        if (err) {
            logger.error(err);
            cb(err, null);
        }
        else {
            // compile staging game snapshot for LIVE
            staginggame = createGameModelForStaging_Live(gameData, res);

            if (res == null) {
                // No game found with received gameid , save this new game
                staginggame.save(function (err, res) {
                    if (err) {
                        logger.error(err);
                        cb(err, null);
                    } else {
                        logger.info("live_stagingGame successfully saved to STAGING db ");
                        copyFiles(gameData._id,function(err,done){
                            logger.info("DONE Copying files : ",done);
                            if(err){
                                //remove game from staging
                                StagingGame.remove({_id:  gameData._id}, function(err, res){
                                    if(!err)
                                    {
                                        logger.info("!!!Game with id : ",  gameData._id," successfully removed from staging game database !!!");
                                        cb(err, null);
                                    }
                                    else {
                                        cb(err, false);
                                    }
                                });
                            }
                            else {
                                cb(null,  {"_id": gameData._id});
                            }
                        })

                    }
                });
            }
            else {
                staginggame.save({_id: gameData._id}, function (err, res) {
                    if (err) {
                        logger.error("ERROR UPDATING GAME: " + gameData._id);
                        cb(err, null);
                    } else {
                        logger.info("live_stagingGame successfully updated to STAGING db " + gameData._id);
                        copyFiles( gameData._id , function(err,done){
                            logger.info("DONE Copying files : ",done);
                            if(err){

                                //remove game from staging
                                StagingGame.remove({_id:  gameData._id}, function(err, res){
                                    if(!err)
                                    {
                                        logger.info("\n!!!Game with id : ",  gameData._id," successfully removed from staging game database !!!\n");
                                        cb(err, null);
                                    }
                                    else {
                                        cb(err, false);
                                    }
                                });
                            }
                            else {
                                cb(null,  {"_id": gameData._id});
                            }
                        })
                    }

                });

            }
        }
    });
}
exports.live_SaveORUpdateGameToStaging = live_SaveORUpdateGameToStaging ;


function live_saveOrUpdateGame(formData, cb){

    StagingGame.findOne({_id: formData.game_id}, function (err, staginggame) {
        if (err) {
            console.log(err);
            cb(err, null);
        }
        else{
                if(staginggame){
                    staginggame.is_active = formData.is_active == 'on'?true :false;
                    staginggame.is_test = formData.is_test =='on'? true :false;
                    if(formData.qa_status == 'Test'){
                        staginggame.save(function(err,result){
                            if(err){
                                console.log("Error saving game to staging live : ",err);
                                cb(err,null);
                            }else{
                                console.log("Game saved to staging live");
                                cb(null,result);
                            }
                        })
                    }else if(formData.qa_status == 'Ready'){
                        if(staginggame.is_active && !staginggame.is_test){
                            Game.findOne({_id: formData.game_id}, function (err, game) {


                                var publishedGame = new Game();

                                publishedGame._id = staginggame._id;
                                publishedGame.display_name = staginggame.display_name ;
                                publishedGame.min_players = staginggame.min_players ;
                                publishedGame.max_players = staginggame.max_players ;
                                publishedGame.lua_file_name = staginggame.lua_file_name;
                                publishedGame.is_active = staginggame.is_active ;
                                publishedGame.is_test = staginggame.is_test ;
                                publishedGame.coins_to_unlock = staginggame.coins_to_unlock ;
                                publishedGame.category = staginggame.category;
                                publishedGame.display = staginggame.display;
                                publishedGame.orientation = staginggame.orientation;
                                publishedGame.version = staginggame.version;

                                var game_mode = {};

                                game_mode.random = staginggame.game_mode.random ;
                                game_mode.pass_and_play = staginggame.game_mode.pass_and_play ;
                                game_mode.friends = staginggame.game_mode.friends ;
                                game_mode.bot = staginggame.game_mode.bot ;

                                publishedGame.game_mode = game_mode;

                                var difficulty_mode = {};

                                difficulty_mode.easy = staginggame.difficulty_mode.easy ;
                                difficulty_mode.medium = staginggame.difficulty_mode.medium ;
                                difficulty_mode.hard = staginggame.difficulty_mode.hard ;

                                publishedGame.difficulty_mode = difficulty_mode;

                                publishedGame.qa_status = 'Ready';
                                publishedGame.bet_amount = staginggame.bet_amount;
                                publishedGame.random_turn_time = staginggame.random_turn_time;
                                publishedGame.friendly_table_timer = staginggame.friendly_table_timer;
                                publishedGame.friendly_bonus_table_time = staginggame.friendly_bonus_table_time;
                                publishedGame.update_time = new Date();



                               // console.log("PUBLISHED GAME === > \n " , JSON.stringify(publishedGame) ,"\n\n");
                                if(game == null){

                                    publishedGame.save(function(err, result){
                                        if(err){
                                            console.error("Unable to publish game to live");
                                            cb(err,null);
                                        }else {
                                            console.log("Game with id ", formData.game_id, " Successfully published to Live db");
                                            copyFilesFromTempToMain(formData.game_id, function (err, res) {
                                                if (res == 'success') {
                                                    removeStagingAndUpdateAllGamesVersion(formData.game_id, function (err, res) {
                                                        if (err) {
                                                            cb(err, null);
                                                        }
                                                        else {
                                                            var dataToSend = {"requestType": httpCallsConfig.GAME_VERSIONS_UPDATED};
                                                            httpCallsHandler.makeHttpRequest(dataToSend, 'post', function (err, done) {
                                                                if (err) {
                                                                    logger.error('Error occurred with http request for game version update ', err);
                                                                }
                                                                else {
                                                                    logger.info('http request for game version update was successful.');
                                                                }
                                                            });
                                                            cb(null, {"_id": formData.game_id, "is_published": true});

                                                        }

                                                    });
                                                }
                                            });

                                            }
                                        });

                                }else{

                                    Game.update({_id: formData.game_id}, publishedGame, function (err, res) {
                                        if (err) {
                                            logger.error('Error updating Game document', err);
                                            cb(err, null);
                                        }
                                        else {
                                            logger.info('Game successfully updated to live Game collection.');
                                            copyFilesFromTempToMain(formData.game_id, function (err, res) {
                                                if(res == "success"){
                                                    removeStagingAndUpdateAllGamesVersion(formData.game_id, function (err, res) {
                                                        if(err){
                                                            cb(err,null);
                                                        }
                                                        else{
                                                            var dataToSend = {"requestType": httpCallsConfig.GAME_VERSIONS_UPDATED};
                                                            httpCallsHandler.makeHttpRequest(dataToSend, 'post', function (err, done) {
                                                                if (err) {
                                                                    logger.error('Error occurred with http request for game version update ', err);
                                                                }
                                                                else {
                                                                    logger.info('http request for game version update was successful.');
                                                                }
                                                            });
                                                            cb(null, {"_id": formData.game_id,"is_published": true});

                                                        }

                                                    });
                                                }
                                            })


                                        }
                                    });

                                }
                            });

                        }

                    }else{
                        logger.info("Error : Either game is not active or is in Test mode .");
                        cb(err, null);
                    }
                }else{
                    Game.findOne({_id: formData.game_id}, function (err, lastPublishedGame) {
                        if(err){
                            logger.error("Error occurred while fetching published game",err);
                            cb(err,null);
                        }else{
                            if(lastPublishedGame){
                               // console.log("Last published Game ",JSON.stringify( lastPublishedGame ));
                                var staginggame  = new StagingGame();
                                staginggame._id = lastPublishedGame._id;
                                staginggame.display_name = lastPublishedGame.display_name ;
                                staginggame.min_players = lastPublishedGame.min_players ;
                                staginggame.max_players = lastPublishedGame.max_players ;
                                staginggame.lua_file_name = lastPublishedGame.lua_file_name;
                                staginggame.is_active = true ;
                                staginggame.is_test = true ;
                                staginggame.coins_to_unlock = lastPublishedGame.coins_to_unlock ;
                                staginggame.category = lastPublishedGame.category;
                                staginggame.display = lastPublishedGame.display;
                                staginggame.orientation = lastPublishedGame.orientation;
                                staginggame.version = lastPublishedGame.version;

                                var game_mode = {};

                                game_mode.random = lastPublishedGame.game_mode.random ;
                                game_mode.pass_and_play = lastPublishedGame.game_mode.pass_and_play ;
                                game_mode.friends = lastPublishedGame.game_mode.friends ;
                                game_mode.bot = lastPublishedGame.game_mode.bot ;

                                staginggame.game_mode = game_mode;

                                var difficulty_mode = {};

                                difficulty_mode.easy = lastPublishedGame.difficulty_mode.easy ;
                                difficulty_mode.medium = lastPublishedGame.difficulty_mode.medium ;
                                difficulty_mode.hard = lastPublishedGame.difficulty_mode.hard ;

                                staginggame.difficulty_mode = difficulty_mode;

                                staginggame.qa_status = 'Ready';
                                staginggame.bet_amount = lastPublishedGame.bet_amount;
                                staginggame.random_turn_time = lastPublishedGame.random_turn_time;
                                staginggame.friendly_table_timer = lastPublishedGame.friendly_table_timer;
                                staginggame.friendly_bonus_table_time = lastPublishedGame.friendly_bonus_table_time;
                                staginggame.update_time = new Date();


                               // console.log("New Staging published Game ",JSON.stringify( staginggame ));
                                    staginggame.save(function(err,result){
                                        if(err){
                                            logger.error("Error saving published game to staging live : ",err);
                                            cb(err,null);
                                        }else{
                                            logger.info("Game saved to staging live");
                                            cb(null,result);
                                        }
                                    });
                            }else{
                                cb(null,null);
                            }

                        }
                    });
                }

        }
    });

}
exports.live_saveOrUpdateGame =live_saveOrUpdateGame ;


var updatePushToLiveStatus = function (gameid,status,cb){
    Game.findOne({_id:gameid},function(err,game){
        if(err){
            cb(err,null);
        }else{
            if(game){
                game.is_pushed_to_live = true;
                game.save(function(err,done) {
                    if (err)
                        cb(err, null);
                    else
                        cb(null, true);
                });

            }else{
                cb(null,false);
            }
        }
    });

};
module.exports.updatePushToLiveStatus = updatePushToLiveStatus;

function createGameModelForStaging_Live(inputData, gameObj) {

    if(gameObj instanceof StagingGame && gameObj){
        var game = gameObj;
    }
    else{
        var game = new StagingGame();
    }


    if (inputData._id )
        game._id = inputData._id;

    if(inputData.display_name)
        game.display_name = inputData.display_name ;


    if (inputData.min_players )
        game.min_players = inputData.min_players ;

    if (inputData.max_players )
        game.max_players = inputData.max_players ;

    if (inputData.lua_file_name )
        game.lua_file_name = inputData.lua_file_name;

    if (inputData.is_active )
        game.is_active = inputData.is_active ;

    if (inputData.is_test )
        game.is_test = inputData.is_test ;

    if (inputData.coins_to_unlock )
        game.coins_to_unlock = inputData.coins_to_unlock ;

    if (inputData.category)
        game.category = inputData.category;

    if (inputData.display)
        game.display = inputData.display;

    if (inputData.orientation)
        game.orientation = inputData.orientation;

    if (inputData.version)
        game.version = inputData.version;

    if(inputData.game_mode) {
        var game_mode = {};

        game_mode.random = inputData.game_mode.random ;
        game_mode.pass_and_play = inputData.game_mode.pass_and_play ;
        game_mode.friends = inputData.game_mode.friends ;
        game_mode.bot = inputData.game_mode.bot ;

        game.game_mode = game_mode;
    }

    if(inputData.difficulty_mode ) {
        var difficulty_mode = {};

        difficulty_mode.easy = inputData.difficulty_mode.easy ;
        difficulty_mode.medium = inputData.difficulty_mode.medium ;
        difficulty_mode.hard = inputData.difficulty_mode.hard ;

        game.difficulty_mode = difficulty_mode;
    }

    if(inputData.qa_status && inputData.qa_status != 'Ready')
        game.qa_status = 'Test';

    if(inputData.bet_amount) {
        game.bet_amount = inputData.bet_amount;
    }

    if(inputData.random_turn_time )
        game.random_turn_time = inputData.random_turn_time;

    if(inputData.friendly_table_timer )
        game.friendly_table_timer = inputData.friendly_table_timer;

    if(inputData.friendly_bonus_table_time)
        game.friendly_bonus_table_time = inputData.friendly_bonus_table_time;

    game.update_time = new Date();
    return game;
}


function copyFiles(gameid,cb){
    var files = ['GameIcon.png', 'GameBanner.jpg', 'GameIcon_Square.png','GameResources.zip','GameResourcesAll.zip'].map(function(name) {
        return readStream(gameid, name);
    })


    Promise.all(files)
        .then(function(result) {
            console.log("All the files were created",result);
            cb(null,'success')
        })
        .catch(function(err){
            console.error("Error : ",err);
            cb(err, 'Failed');
        });
}


function uploadGameFiles(gameid, filename, cb) {

    //var baseURL = 'http://110.227.129.246:8000/';

    var baseURL =  constants.SOURCE_URL_TO_PULL_GAME_ASSETS  ;
    //if(envConfig.CURRENT_SERVER_ENV == envConfig.SERVER_ENV_TYPE.QA_DEV )
    //    baseURL = 'http://110.227.129.246:8000/';
    //else if(envConfig.CURRENT_SERVER_ENV == envConfig.SERVER_ENV_TYPE.QA_PROD )
    //    baseURL = 'http://110.227.129.246:8000/';
    //else if(envConfig.CURRENT_SERVER_ENV == envConfig.SERVER_ENV_TYPE.LIVE_DEV )
    //    baseURL = 'http://52.86.35.40:8000/';

    var sourceURL = baseURL + '/games/' + gameid + '/' + filename;
    var localPath = 'uploads/games/' + gameid + '/temp' ;
    console.log("SOURCE PATH  = > ",sourceURL);
   // console.log("LOCAL PATH  = > ",localPath);

    fse.ensureDir(localPath, function (err) {
        if(err){
            console.log(err) // => null
            cb(err,null);
        }
       else {
            // dir has now been created, including the directory it is to be placed in
            localPath = localPath +  '/' + filename;
            console.log("Final LOCAL PATH  = > ",localPath);
            var r = request(sourceURL);

            r.on('response', function (res) {

                var st = require('fs').createWriteStream(localPath);
                st.on('error --- >', cb);
                r.pipe(st);

                res.on('end', function () {
                    cb(null, 'success in creating file : ' + localPath);
                });

                res.on('error', cb)
            });

            r.on('error', cb);
        }
    })

}