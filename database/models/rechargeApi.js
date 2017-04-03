/**
 * Created by harihar on 08/06/16.
 */

var mongoose     = require('mongoose');
var dbHandler    = require('../dbHandler');

var recharge = new mongoose.Schema({

    order_id        : {type: String, required: true ,unique: true},     // unique client id
    pay_id          : {type: String},
    transaction_id  : {type: String},
    phone_number    : {type: String},
    player_id       : {type: String},
    operator_id     : {type: Number},
    amount          : {type: String},
    status          : {type: String},
    status_message  : {type: String},
    timestamp       : {type: Date, default: Date.now}

});

module.exports  = dbHandler.getRemoteDb().model('recharge', recharge);