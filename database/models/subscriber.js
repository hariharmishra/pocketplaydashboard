/**
 * Created by harihar on 11/06/16.
 */

var mongoose     = require('mongoose');
var dbHandler    = require('../dbHandler');

var subscriber = new mongoose.Schema({

    email : {type: String , unique: true ,required :true},
    is_subscribed : {type:Boolean, default: true},
    added_on : {type: Date, default: Date.now}

});

module.exports  = dbHandler.getRemoteDb().model('subscriber', subscriber);