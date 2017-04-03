/**
 * Created by harihar on 11-05-2016.
 */
var env = require('./env');

var mongo = {
    auth_on: true,
    host   : 'localhost',
    port   : '27017',
    notif_db_name: 'notificationdb',
    pp_db_name : 'zest',
    dashboard_db_name : 'ppdash',
    user   : 'nikhil',
    pwd    : 'nik38',
    auth_db: 'zest'
};

module.exports = mongo;