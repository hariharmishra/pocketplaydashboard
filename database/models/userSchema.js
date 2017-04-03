var mongoose     = require('mongoose');
var dbHandler    = require('../dbHandler');
var constants = require('../../config/constants');

var User = new mongoose.Schema({
    country_id:{
        type:String
    },

    device_info:{
        os:{type:Number},
        language:{type:String},
        model:{type:String},
        make:{type:String},
        os_version:{type:String},
        push_token:{type:String}
    },

    player_id : {
        type : Number
    },

    level : {
        type : Number,
        default : 1
    },

    device_id:{
        type:String,
        required:true
    },

    display_name:{
        type:String
    },

    profile_pic_1:{
        type:String
    },

    profile_pic_2:{
        type:String
    },

    dob : {
        type:String
    },

    gender : {
        type: Number,
        enum: [0,1,2,3],
        required: true
    },

    game_version:{
        type: String
    },

    authorised_games :[{game_id:{type: String, required:true, ref:'Game'}, has_paid : {type : Boolean},is_lock : {type : Boolean}}],

    purchased_game :[{game_id:{type: String, required:true, ref:'Game'},purchase_token : {type : String}, access_token : {type : String},product_id : {type : String}}],

    games:[{
        game_id:{type:String},
        is_unlocked: {type : Boolean, default : false},

        friendly_plays_count: {type : Number, default : 0},
        friendly_win_count: {type : Number, default : 0},
        friendly_coins_won : {type : Number, default : 0},
        friendly_loss_count: {type : Number, default : 0},
        friendly_coins_loss : {type : Number, default : 0},

        random_plays_count: {type : Number, default : 0},
        random_win_count:{type : Number, default : 0},
        random_coins_won : {type : Number, default : 0},
        random_loss_count:{type : Number, default : 0},
        random_coins_loss : {type : Number, default : 0}

    }],

    coins_won : {
        type : Number, default : 0
    },

    matches_plays : {
        type : Number, default : 0
    },

    matches_won : {
        type : Number, default : 0
    },

    matches_loss : {
        type : Number, default : 0
    },

    coins_loss : {
        type : Number, default : 0
    },

    blocked_user : [{
        type:mongoose.Schema.Types.ObjectId, required:true, ref:'User'
    }],

    friends : {
        buddies: [{
            user_id: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
            invitation_status: {type: Number, enum: [0, 1, 2]},
            invitation_type: {type: Number, enum: [0, 1], required: true}
        }]
    },

    privacy_policy : {
        friend_visibility : {type : Number, enum: [constants.PRIVACYCONSTANTS.EVERYONE, constants.PRIVACYCONSTANTS.FRIEND,constants.PRIVACYCONSTANTS.NONE]},
        message_permission : {type : Number, enum : [constants.PRIVACYCONSTANTS.EVERYONE, constants.PRIVACYCONSTANTS.FRIEND]},
        friend_request : {type : Number, enum : [constants.PRIVACYCONSTANTS.EVERYONE,constants.PRIVACYCONSTANTS.NONE]},
        table_request : {type : Number, enum : [constants.PRIVACYCONSTANTS.EVERYONE, constants.PRIVACYCONSTANTS.FRIEND,constants.PRIVACYCONSTANTS.NONE]},
        available_status_visibility : {type : Boolean, default : true}
    },

    other_params:{
        is_rc_available:Boolean
    },

    msisdn:{
        type:Number
    },

    send_queue:[{
        type:String
    }],

    updated_tables:[{
        type:mongoose.Schema.Types.ObjectId, required:true, ref:'Table'
    }],

    updated_chats:[{
        type:mongoose.Schema.Types.ObjectId, required:true, ref:'ChatHead'
    }],

    tables:[{
        type:mongoose.Schema.Types.ObjectId, required:true, ref:'Table'
    }],

    created_at:{
        type:Date,
        default:Date.now
    },

    updated_at:{
        type:Date,
        default:Date.now
    },

    last_register_time:{
        type:Date,
        default:Date.now
    },

    status:{
        type:String,
        enum:['OK','MSISDN_LEFT']
    },

    lp_table_contacts:[{
        type:mongoose.Schema.Types.ObjectId, required: true, ref:'User'
    }],

    lp_user_contacts:[{
        msisdn:{type:Number},
        user_id:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
        display_name:{type : String},
        country_id : {type : String}
    }],

    lp_added_pals:[{
        type:mongoose.Schema.Types.ObjectId, required:true, ref:'User', unique : true
    }],

    login_type : {
        type: Number, enum: [0,1,2,3,4], required: true,default: 4
    },

    balance : {
        type: Number , default: constants.DEFAULTBALANCE
    },

    recharge_balance : {
        type: Number, default: 0
    },

    image_text_version : {
        type : String, default: '1|1'
    },

    purchased_products : {
        os: {
            ios:[{
                type:String
            }],
            android:[{
                type:String
            }]
        }
    },

    profile_views : {
        type : Number,
        default : 0
    },

    profile_status : {
        type : String,
        default : 'Pocket Play Only'
    },

    referrers : [{
        type:mongoose.Schema.Types.ObjectId, ref:'User'
    }],

    referee : {
        type:mongoose.Schema.Types.ObjectId, ref:'User'
    },

    referrer_code : {
        type : String
    },

    versions : {
        config : {type : String},
        in_app_products : {type : String}
    },

    social_balance : {
        fb : {type : Boolean, default : false}, twitter : {type : Boolean, default : false}
    }

});


module.exports  = dbHandler.getRemoteDb().model('User', User);