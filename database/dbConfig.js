var constants = require('../config/constants');


var host = constants.MONGO_HOST;
var port = constants.MONGO_PORT;
var user = constants.MONGO_USER;
var passwd = constants.MONGO_PSWD;
var notif_db_name = constants.MONGO_NOTIFICATION_DB_NAME;
var pp_db_name = constants.MONGO_PP_DB_NAME;
var dashboard_db_name = constants.MONGO_DASHBOARD_DB_NAME;

// m_lab db config
var m_lab_dash_db_host = constants.M_LAB_DASH_DB_HOST;
var m_lab_pp_db_host = constants.M_LAB_PP_DB_HOST;
var m_lab_notif_db_host = constants.M_LAB_NOTIF_DB_HOST;
var m_lab_dash_db_port = constants.M_LAB_DASH_DB_PORT;
var m_lab_pp_db_port = constants.M_LAB_PP_DB_PORT;
var m_lab_notif_db_port = constants.M_LAB_NOTIF_DB_PORT;
var m_lab_user = constants.M_LAB_USER;
var m_lab_passwd = constants.M_LAB_PSWD;
var m_lab_notif_db_name = constants.M_LAB_NOTIF_DATABASE_NAME;
var m_lab_pp_db_name = constants.M_LAB_PP_DATABASE_NAME;
var m_lab_dashboard_db_name = constants.M_LAB_DASHBOARD_DATABASE_NAME;


if(constants.ENV_TYPE === 'heroku'){
    exports.dbURL = 'mongodb://'+ m_lab_user + ':' + m_lab_passwd + '@' + m_lab_notif_db_host + ':' + m_lab_notif_db_port + '/' + m_lab_notif_db_name;
    exports.remoteDBURL = 'mongodb://'+ m_lab_user + ':' + m_lab_passwd + '@' + m_lab_pp_db_host + ':' + m_lab_pp_db_port + '/' + m_lab_pp_db_name;
    exports.ppdashDBURL = 'mongodb://'+ m_lab_user + ':' + m_lab_passwd + '@' + m_lab_dash_db_host + ':' + m_lab_dash_db_port + '/' + m_lab_dashboard_db_name;

}else{
    exports.dbURL = 'mongodb://'+ host + ':' + port + '/' + notif_db_name;
    exports.remoteDBURL = 'mongodb://'+ host + ':' + port + '/' + pp_db_name;
    exports.ppdashDBURL = 'mongodb://'+ host + ':' + port + '/' + dashboard_db_name;
}






exports.loglevel = require('../config/opts').scheme.options.db.loglevel;