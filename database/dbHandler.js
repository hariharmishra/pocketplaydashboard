/**
 * Created by harihar on 21/02/16.
 */

//Set DB attributes...

var mongoose = require('mongoose');
var dbConfig = require('./dbConfig');
var logger = require('../logger/logger.js').getLogger('dbHandler');
var localDBConnection  ;
var remoteDBConnection ;
var ppDashDbConnection;


//create connection to local database
function initLocalDb(cb){

    // set logging level
    mongoose.mongo.Logger.setLevel(dbConfig.loglevel);

    localDBConnection = mongoose.createConnection(dbConfig.dbURL);

    localDBConnection.on('connected', function() {
        logger.info('Mongoose connected to local database');
        cb(true);
    });

    localDBConnection.on('error', function(err) {
        logger.error('Error connecting to local database',err);
        cb(false);
    });

}
module.exports.initLocalDb = initLocalDb;

module.exports.getLocalDb = function(){
    return localDBConnection;
};


//create connection to remote database zest

function initRemoteDb(cb){

    // set logging level
    mongoose.mongo.Logger.setLevel(dbConfig.loglevel);

    remoteDBConnection = mongoose.createConnection(dbConfig.remoteDBURL);

    remoteDBConnection.on('connected', function() {
        logger.info('Mongoose connected to remote database zest');
        cb(true);
    });

    remoteDBConnection.on('error', function(err) {
        logger.error('Error connecting to remote database',err);
        cb(false);
    });

}
module.exports.initRemoteDb = initRemoteDb;

module.exports.getRemoteDb = function(){
    return remoteDBConnection;
};


//create connection to remote database ppdash

function initPPDashDb(cb){

    // set logging level
    mongoose.mongo.Logger.setLevel(dbConfig.loglevel);

    ppDashDbConnection = mongoose.createConnection(dbConfig.ppdashDBURL);

    ppDashDbConnection.on('connected', function() {
        logger.info('Mongoose connected to remote database ppdash');
        cb(true);
    });

    ppDashDbConnection.on('error', function(err) {
        logger.error('Error connecting to remote database ppdash',err);
        cb(false);
    });

}
module.exports.initPPDashDb = initPPDashDb;

module.exports.getPPDashDb = function(){
    return ppDashDbConnection;
};




// Close db connections calls...

function closeLocalDb(cb){
   var localDBConnection = this.getLocalDb;
    if(localDBConnection === undefined || null) {
        return cb(false);
    }
    else {
        this.getLocalDb.disconnect();
        cb(true);
    }

}

module.exports.closeLocalDb = closeLocalDb;


function closeRemoteDb(cb){
    var remoteDBConnection = this.getLocalDb;
    if(remoteDBConnection === undefined || null) {
        return cb(false);
    }
    else {
        this.getRemoteDb().disconnect();
        cb(true);
    }

}

module.exports.closeRemoteDb = closeRemoteDb;


function closePPDashDb(cb){
    var ppDashDbConnection = this.getPPDashDb();
    if(ppDashDbConnection === undefined || null) {
        return cb(false);
    }
    else {
        this.getPPDashDb().disconnect();
        cb(true);
    }

}

module.exports.closePPDashDb = closePPDashDb;
