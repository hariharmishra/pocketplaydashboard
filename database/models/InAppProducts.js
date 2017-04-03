var mongoose     = require('mongoose');
var dbHandler    = require('../dbHandler');

var InAppProducts = new mongoose.Schema({

    price : {
        type: String, required:true
    },
    currency : {
        type: String, required:true
    },
    type :{
        type: Number, enum: [0, 1], required:true
    },
    reference_name :{
        type: String, required:true
    },
    rewarded_amount : {
        type: String, required:true
    },
    reference_inappid :{
        type: String,required:true
    },
    unit : {
        type: String, required:true
    },
    priority : {
        type : Number
    },
    percentage :{
        type : Number
    },
    product_type: {
        type : String, enum:['normal', 'special']
    },
    most_popular : {
        type : Boolean, default : false
    },
    created_at :{
        type:Date, default:Date.now, required:true
    },
    updated_at :{
        type:Date, default:Date.now, required:true
    }
});

module.exports  = dbHandler.getRemoteDb().model('InAppProducts', InAppProducts);
