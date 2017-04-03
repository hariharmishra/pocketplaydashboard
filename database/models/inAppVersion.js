/**
 * Created by harihar on 15/04/16.
 */

var mongoose     = require('mongoose');
var dbHandler    = require('../dbHandler');



var inAppVersion = new mongoose.Schema({
    version : {type: String , default :'0.0'},
    updated_at : {type : Date , default: Date.now}
});


module.exports  = dbHandler.getRemoteDb().model('inAppVersion', inAppVersion);