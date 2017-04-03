/**
 * Created by harihar on 18/03/16.
 */

var mongoose     = require('mongoose');
var dbHandler    = require('../dbHandler');

var Game = new mongoose.Schema({
    _id: {
        type: String,
        unique:true
        // required:true
    },
    display_name: {
        type: String,
        // required:true
    },
    min_players: {
        type: Number,
        // required:true
    },
    max_players: {
        type: Number,
        // required:true
    },
    version: {
        type: String,
        //   required:true
    },
    lua_file_name: {
        type: String,
        //  required:true
    },
    coins_to_unlock: {
        type: Number
    },

    category: {
        type: Number
    },
    display: {
        type: Number
    },
    random_turn_time: {
        type: Number
    },
    friendly_table_timer: {
        type: Number, default: 86400
    },
    friendly_bonus_table_time: {
        type: Number, default: 3600
    },
    bet_amount: {
        type: [{type: Number}]
    },
    is_active: {
        type: Boolean ,default:false
    },
    is_test: {
        type: Boolean ,default:true
    },
    orientation: {
        type: String ,default : 'Portrait'
    },
    game_mode: {
        random: {type: Boolean},
        pass_and_play: {type: Boolean},
        friends: {type: Boolean},
        bot: {type: Boolean}
    },
    difficulty_mode: {
        easy : {type: Boolean},
        medium : {type : Boolean},
        hard : {type : Boolean}
    },

    qa_status : {type :String ,default :'Test'},

    is_pushed_to_live :{type :Boolean ,default :false},

    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default : Date.now
    }
});

module.exports  = dbHandler.getRemoteDb().model('Game', Game);