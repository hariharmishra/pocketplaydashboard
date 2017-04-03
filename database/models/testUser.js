/**
 * Created by harihar on 02/05/16.
 */


var mongoose     = require('mongoose');
var dbHandler    = require('../dbHandler');

var testUser = new mongoose.Schema({

  //  _id : { type: String, unique: true },
    name: {type: String},
    device_os: {type: String},
    device_udid: {type: String},
    phone: {type: String},
    is_enabled: {type: Boolean},
    added_on: {type: Date, default: Date.now}

});

//
//testUser.pre('save', function(done) {
//
//    this._id = new Date().getTime().toString(12);
//    console.log("inside save pre",this._id,typeof this._id);
//    done();
//});


module.exports  = dbHandler.getRemoteDb().model('testUser', testUser);

