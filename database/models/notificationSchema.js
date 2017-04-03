/**
 * Created by harihar on 21/02/16.
 */


var mongoose     = require('mongoose');
var dbHandler    = require('../dbHandler');

var notif_Informative =  new mongoose.Schema({

    image           : [{type:String}],
    url             : String ,
    buttonText      : String

});

var notif_DailyDeals =  new mongoose.Schema({

    image           : [{type:String}],
    url             : String ,
    buttonText      : String ,
    benefit         : [{coins: {type:Number ,default : 0}}]

});

var notif_AppOfTheDay =  new mongoose.Schema({

    image           : [{type:String}],
    url             : String ,
    buttonText      : String ,
    benefit         : [{coins: {type:Number ,default : 0}}]

});


var NotificationSchema   = new mongoose.Schema({
    type            : {type: Number },
    title           : String ,
    message         : String ,
    lastModified    : { type: Date, default: Date.now },
    startDate       : { type: Date, default: Date.now },
    deviceOS        : String ,
    status          : {type: Number , default : 1},
    countries       : Array,
    data            : {notif_Informative : notif_Informative, notif_DailyDeals: notif_DailyDeals, notif_AppOfTheDay: notif_AppOfTheDay}

});

module.exports  = dbHandler.getLocalDb().model('notification', NotificationSchema);



