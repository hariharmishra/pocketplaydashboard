/**
 * Created by Nikhil on 05/05/16.
 */

var moment = require('moment');

var defaultTimeStampFormat="YYYY-MM-DD HH:mm:ss.SSS";

exports.currentTimestamp=function(){

    return this.currentTimeStampInFormat(defaultTimeStampFormat);
}

exports.currentTimeStampInFormat=function(format){
    return moment().format(format);
}

exports.timeDiffInDays=function(time1,time2){
    var diff;
}
