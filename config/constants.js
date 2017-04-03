/**
 * Created by harihar on 21/04/16.
 */

var opts = require('./opts');
var logger = require('../logger/logger.js');

exports.SERVER_IP = opts.appConfig.serverIPAddress;
exports.SERVER_PORT = process.env.PORT ||  opts.appConfig.serverPort  ;
exports.ROUTER_TO_LOAD = opts.appConfig.routerToLoad;
exports.DASHBOARD_SIDEPANEL_TO_LOAD = opts.appConfig.dashboardSidePanelToLoad;
exports.INTER_SERVER_HTTP_POST_URL = opts.appConfig.interServerHTTPPostURL;
exports.SOURCE_URL_TO_PULL_GAME_ASSETS = opts.appConfig.sourceURLToPullGameAssets;
exports.MONGO_HOST = opts.mongo.host;
exports.MONGO_PORT = opts.mongo.port;
exports.MONGO_USER = opts.mongo.user;
exports.MONGO_PSWD = opts.mongo.pwd;
exports.MONGO_NOTIFICATION_DB_NAME = opts.mongo.notif_db_name;
exports.MONGO_PP_DB_NAME = opts.mongo.pp_db_name;
exports.MONGO_DASHBOARD_DB_NAME = opts.mongo.dashboard_db_name;
exports.REDIS_HOST = opts.redis.host;
exports.REDIS_PORT = opts.redis.port;
exports.ENV_TYPE = opts.appConfig.environment;
exports.DEFAULTBALANCE = 50000;
exports.PRIVACYCONSTANTS = {
    EVERYONE: 0,
    FRIEND: 1,
    NONE: 2
};
exports.HTTP_REQUEST_STATUS = {
    FAILED : 0,
    RETRYING : 1
};

exports.M_LAB_USER = 'nikhil';
exports.M_LAB_PSWD = 'nik38';
exports.M_LAB_NOTIF_DB_HOST = 'ds153765.mlab.com';
exports.M_LAB_PP_DB_HOST = 'ds153745.mlab.com';
exports.M_LAB_DASH_DB_HOST = 'ds153765.mlab.com';
exports.M_LAB_NOTIF_DB_PORT = '53765';
exports.M_LAB_PP_DB_PORT = '53745';
exports.M_LAB_DASH_DB_PORT = '53765';
exports.M_LAB_NOTIF_DATABASE_NAME = 'notificationdb';
exports.M_LAB_PP_DATABASE_NAME = 'zest';
exports.M_LAB_DASHBOARD_DATABASE_NAME = 'ppdash';





