/**
 * Created by harihar on 29/03/16.
 */

var mongoose     = require('mongoose');
var dbHandler    = require('../dbHandler');

var paytm =  {

    registered_user_balance :{
        type: String
    },
    guest_user_balance :{
        type: String
    },
    referral_bonus:{
        type: String
    },
    min_recharge_bal :{
        type: String
    },
    country_list:{
        type : Array,default:'IN'
    }
};

var configuration = new mongoose.Schema({

    registered_user_default_coins : {
        type: String
    },
    guest_user_default_coins : {
        type: String
    },
    referral_bonus :{
        type: String
    },
    fb_like_bonus :{
        type: String
    },
    default_login: {
        type : String, enum:['register', 'guest']
    },
    rewarded_video_coins :{
        type: String
    },

    paytm : paytm,

    version : {type :String ,default :'0.0'
    },

    updated_at :{
        type:Date, default:Date.now
    }
});

module.exports  = dbHandler.getRemoteDb().model('configuration', configuration);
