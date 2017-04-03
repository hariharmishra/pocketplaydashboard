/**
 * Created by harihar on 12/04/16.
 */

var mongoose     = require('mongoose');
var dbHandler    = require('../dbHandler');
var constants = require('../../config/constants');


var httpTransactions = new mongoose.Schema({

    tranx_type      :    {type : String , unique: true},
    tranx_id        :    {type : String , unique: true},
    request_method  :    {type : String},
    request_body    :    {type : String},
    request_url     :    {type : String},
    sender_ip       :    {type : String},
    receiver_ip     :    {type : String},
    status_code     :    {type : String},
    request_status  :    {type : Number ,enum :[constants.HTTP_REQUEST_STATUS.DONE , constants.HTTP_REQUEST_STATUS.FAILED,constants.HTTP_REQUEST_STATUS.RETRYING]},
    message         :    {type : String},
    retryCount      :    {type : Number , default:0},
    data            :    {type : String},
    timestamp       :    {type : Date ,default : Date.now}
});


module.exports  = dbHandler.getRemoteDb().model('httpTransaction', httpTransactions);