/**
 * Created by harihar on 18/03/16.
 */

var mongoose     = require('mongoose');
var dbHandler    = require('../dbHandler');



var gameVersion = new mongoose.Schema({
    Version : {type: String},
    IsRCAvailable :{type : Boolean},
    IsSciptDownloadable : {
        "IOS" : {type : Boolean},
        "ANDROID" : {type : Boolean}
    },
    BasePath : {type : String},
    created_at : {type : Date}
});


module.exports  = dbHandler.getRemoteDb().model('gameVersion', gameVersion);


