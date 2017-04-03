///**
// * Created by harihar on 04/05/16.
// */
//
//
//var winston = require('winston');
//var dateTimeUtils = require('../utils/dateTimeUtility.js');
//winston.emitErrs = true;
//var config = require('winston/lib/winston/config');
var emailUtils = require('../utils/emailUtility.js');
//
//var logger = new winston.Logger({
//    transports: [
//        new winston.transports.File({
//            level: 'info',         //default:info
//            filename: './logger/all-logger.log',
//            handleExceptions: true,
//            json: true,
//            maxsize: 5242880, //5MB
//            maxFiles: 5,
//            colorize: true
//        }),
//        new winston.transports.Console({
//            level: 'debug',
//            handleExceptions: true,
//            json: false,
//            formatter: function(options) {
//                // Return string will be passed to logger.
//                return '[' + dateTimeUtils.currentTimestamp() + '] - '+ config.colorize(options.level,options.level.toUpperCase()) + ' | MSG = '+ (undefined !== options.message ? options.message : '');
//            }
//        })
//    ],
//
//    exitOnError: false
//});
//
//
//
//module.exports = logger;
//
//
//module.exports.stream = {
//    write: function(message, encoding){
//        logger.info(message);
//    }
//};
//
//process.on('uncaughtException', function (err) {
//
//    console.log(err.stack);
//    var from  = 'nikhilbholacse@gmail.com';
//    var to    = 'nikhil@lambentgamestudio.com';
//    var subject = err.message;
//    var message = "Hello !\n\nYou are receiving this mail because a crash occurred on pocket play server. \n Error stack trace = \n" + err.stack;
//
//    emailUtils.sendEmail(from,to,subject,message,function (err,done) {
//        if (err)
//            logger.error("Unable to send mail.Reason : ",err, "Exiting Process... :(");
//        else
//            logger.info("Crash report was successfully emailed to ",to);
//
//        //Exit process after trying to send email.
//        //setTimeout(function(){
//        //    // Uncaught Exception occurred ... Exiting process .
//        //    process.exit(1);
//        //},2000);
//
//    });
//});
//
//
//
//
///**
// *
//- This is a unit test for uncaught exceptions
//
//process.once('uncaughtException', function (err) {
//
//    var from  = 'nikhilbholacse@gmail.com';
//    var to    = 'nikhil@lambentgamestudio.com';
//    var subject = err.message;
//    var message = "Hello !\n\nYou are receiving this mail because a crash occurred on pocket play server. \n Error stack trace = \n" + err.stack;
//
//    emailUtils.sendEmail(from,to,subject,message,function (err,done) {
//        if (err)
//            logger.error("Unable to send mail.Reason : ",err, "Exiting Process... :(");
//        else
//            logger.info("Crash report was successfully emailed to ",to);
//
//        //Exit process after trying to send email.
//        setTimeout(function(){
//            // Uncaught Exception occurred ... Exiting process .
//            process.exit(1);
//        },2000);
//
//    });
//});
//
//throw new Error('This is a test mail for crash testing from pocket play .');
//
// */

var loggerLib = require("winston");
var opts = require('../config/opts');

var application ;
var initialized;
var loggers = {};
var app = require('../app');


module.exports.init = function(app) {
    if(!initialized) {
        application = app || 'default';
        initialized = true;
        console.log('Initializing logger with log file: ' + opts.logging.file);
    }
};

this.init(app);

module.exports.close = closeLogger;


module.exports.getLogger = function(category, level) {

    var key = category.toLowerCase();
    var logger = loggers[key];

    if(!logger){
        logger = initialize(key, level);
        loggers[key] = logger;
    }
    return logger;
};


function initialize(category, level) {

    const catOpts = opts.logging[category.toLowerCase()] || {level: opts.logging.level};
    level = level || catOpts.level;

    const handleException = loggerLib.loggers.length === 0;
    const catLabel = (category.length > 14 ? category.substr(0, 14) : category);
    loggerLib.loggers.add(category,
        {
            transports: [
                new loggerLib.transports.Console({
                    name            : opts.instance + '-console',
                    colorize        : true,
                    handleExceptions: handleException,
                    json            : false,
                    timestamp       : true,
                    level           : level,
                    label           : opts.instance + ' ' + catLabel
                }),
                new loggerLib.transports.File({
                    name            : opts.instance + '-common',
                    filename        : opts.logging.file,
                    handleExceptions: handleException,
                    json            : false,
                    maxsize         : 100242880, //100MB
                    maxFiles        : 5,
                    colorize        : false,
                    level           : level,
                    timestamp       : true,
                    label           : opts.instance + ' ' + catLabel
                })
            ]
        });

    var logger = loggerLib.loggers.get(category);
    logger.exitOnError=false;
    logger.level = level;

    logger.padLevels = true;
    logger.levelLength = 19 - catLabel.length;

    if(catOpts.file) {
        logger.add(new loggerLib.transports.File({
            name            : opts.instance + '-' + category,
            filename        : typeof catOpts.file != 'string' ? '../logs/' + category + '.log' : catOpts.file,
            handleExceptions: handleException,
            json            : false,
            maxsize         : 100242880, //100MB
            maxFiles        : 5,
            colorize        : false,
            level           : level,
            timestamp       : true,
            label           : opts.instance + ' ' + catLabel
        }), null, true)
    }


    if(!logger.err) {
        logger.silly('Assigned error function to err');
        logger.err = logger.error;
    }

    logger.isDebug = function() {
        return logger.levels[logger.level] >= logger.levels['debug'];
    };
    return logger;
}

function closeLogger() {
    Object.keys(loggers).forEach(function(key) {
        loggers[key].close();
    });
}

process.on('uncaughtException', function (err) {

    console.log(err.stack);

    var to    = 'nikhil@lambentgamestudio.com';
    var subject = err.message;
    var message = "Hello !\n\nYou are receiving this mail because a crash occurred on pocket play server. \n Error stack trace = \n" + err.stack;

    emailUtils.sendEmail(to,subject,message,function (err,done) {
        if (err)
            console.error("Unable to send mail.Reason : ",err, "Exiting Process... :(");
        else
            console.info("Crash report was successfully emailed to ",to);

        //Exit process after trying to send email.
        //setTimeout(function(){
        //    // Uncaught Exception occurred ... Exiting process .
        //    process.exit(1);
        //},2000);

    });
});