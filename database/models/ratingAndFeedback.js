/**
 * Created by harihar on 26/05/16.
 */

var mongoose     = require('mongoose');
var dbHandler    = require('../dbHandler');



var ratingAndFeedback = new mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    rating  : {type : Number},
    feedbacks :[
                {
                    message : {type : String},
                    updated_at : {type : Date, default : Date.now}
                }
    ],
    created_at : {type : Date ,default: Date.now}
});


module.exports  = dbHandler.getRemoteDb().model('ratingAndFeedback', ratingAndFeedback);


