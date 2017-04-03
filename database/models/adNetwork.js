/**
 * Created by harihar on 28/04/16.
 */


var mongoose     = require('mongoose');
var dbHandler    = require('../dbHandler');

var adNetwork = new mongoose.Schema({

    ad_show_locations_interstitial: {
        on_bootup: {type: Boolean},
        on_game_finished: {type: Boolean},
        on_back_from_game: {type: Boolean},
        on_back_from_user_profile: {type: Boolean},
        on_app_exit: {type: Boolean}
    },

    ad_show_locations_banner: {
        on_matches : {type: Boolean},
        on_games : {type: Boolean},
        on_chat : {type: Boolean},
        on_profile : {type: Boolean},
        in_game : {type: Boolean}
    },

    interstitial_time_interval: {
        type: Number , default : 60
    },

    videoAd_time_interval: {
        type: Number , default : 10
    },

    minimum_bootup_for_ads :{
        type:Number, default : 0
    },

    ad_networks: [
        {
            ad_network_name: {type: String},
            ad_network_type: {type: String, enum: ['banner', 'interstitial','video']},
            ad_network_priority: {type: Number},
            ad_network_keys: {
                app_key: String,
                secret_key: String
            },
            is_enabled: {type: Boolean}
        }
    ],

    ad_networks_for_OS: {type: String, enum: ['ios', 'android']},

    updated_at: {
        type: Date, default: Date.now
    }
});

module.exports  = dbHandler.getPPDashDb().model('adNetwork', adNetwork);
