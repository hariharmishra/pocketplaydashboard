/**
 * Created by harihar on 18/03/16.
 */

var mongoose     = require('mongoose');
var dbHandler    = require('../dbHandler');

var staginggame = new mongoose.Schema({
    _id: {
        type: String,
        unique : true
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
        type: Number , default: 0
    },

    category: {
        type: Number
    },
    display: {
        type: Number
    },
    random_turn_time: {
        type: Number, default: 30
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

    // [ Test : new game added || Ready : game in published mode || Published_Edit : making changes in published game  ]
    qa_status : {type :String ,default :'Test'},

    is_game_text_modified : {type: Boolean ,default :false},
    is_game_icon_modified : {type: Boolean ,default :false},
    is_game_icon_square_modified : {type: Boolean ,default :false},
    is_game_banner_modified : {type: Boolean ,default :false},
    is_game_resources_modified : {type: Boolean ,default :false},
    is_game_resources_all_modified : {type: Boolean ,default :false},

    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default :Date.now
    }
});

staginggame.pre('save', function(done) {
  //  console.log("inside save pre");
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    done();
});



module.exports  = dbHandler.getRemoteDb().model('staginggame', staginggame);