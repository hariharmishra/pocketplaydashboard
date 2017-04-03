/**
 * Created by harihar on 11-05-2016.
 */
var env = require('./env');

var mongo = {
    auth_on: true,
    host   : '52.86.35.40',
    port   : '27017',
    notif_db_name: 'notificationdb',
    pp_db_name : 'zest',
    dashboard_db_name : 'ppdash',
    user   : 'plamego',
    pwd    : 'plamego',
    auth_db: 'zest'
};

module.exports = mongo;