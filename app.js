/**
 * Created by Nikhil on 17/02/16.
 */

    // App constants

    var http = require('http');
    var compression = require('compression');
    var constants = require('./config/constants.js');
    var db = require('./database/dbHandler');
    var logger = require('./logger/logger.js').getLogger('app');
    var express = require('express');
    var bodyParser = require('body-parser');
    var redisController = require('./controllers/redisController');
    var snsUtil = require('./config/snsUtil');

    var app = express();
    var jade = require('jade');             //view template engine
    app.use(compression());                 // compress the requests, responses

/**
 * The POST request send by AWS SNS service to the http endpoint/url on this server is having
 * CONTENT-TYPE set as plain/text ,but the express middleware bodyParser.json is expecting a json hence we need
 * to convert the text send by SNS into JSON , thus we override content-type before bodyParser.
 */
    app.use(snsUtil.overrideContentType());

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded(({ extended: true })));
    app.use(express.static('uploads'));
    app.use(express.static('public'));      // public folder where all static files(images,etc...) exists

    /* Log every request coming to the server */
    app.use(function(req,res,next){
        logger.info("Got " + req.method + " request for " + req.url );
        next();
    });

    app.set('view engine',jade);

    app.locals.moment = require('moment');


    var server  = app.listen(constants.SERVER_PORT,function(){

        var host = constants.SERVER_IP;
        var port = constants.SERVER_PORT;

        logger.info("Express-server listening at address http://" + host + " on port " + port);

        //set app globals to be used in view
        if(constants.SERVER_IP === 'web.pocketplay.com')
            app.locals.BASE_URL = 'http://' + host + '/';
        else
            app.locals.BASE_URL = 'http://' + host + ':' + port +'/';
        logger.info("BASE URL set to : ", app.locals.BASE_URL);

        //set up sidebar
        app.locals.DASHBOARD_SIDEPANEL_TO_LOAD = constants.DASHBOARD_SIDEPANEL_TO_LOAD;
        logger.info("SIDEBAR Panel to load : ",app.locals.DASHBOARD_SIDEPANEL_TO_LOAD);

        //Initiate Redis Database
        redisController.init(function(err){
            if(err){
                logger.error('Error initiating redis.');
                throw new Error('Redis initiating error ',err.stack);
            }else{
               logger.info("REDIS INITIALIZED...");
            }
        });

        //start the dbs[local,remote] ...
        logger.info("Connecting to local db...");
        db.initLocalDb(function(success){
            if(success){
                logger.info("Connecting to remote db : [ZEST]...");
                db.initRemoteDb(function(success){
                    if(success) {
                        logger.info("Connecting to remote db : [PPDASH]...");
                        db.initPPDashDb(function (success) {
                            if (success) {

                                var router = require('./routes/'+constants.ROUTER_TO_LOAD);
                                router.initExpress(app);

                            } else {
                                logger.error("Connection to remote db [PPDASH] failed .*** Disabling Routes ***");
                            }
                        });
                    }
                    else {
                        logger.error("Connection to remote db [ZEST] failed .*** Disabling Routes ***");
                    }
                })
            }
            else {
                logger.error("Connection to local db failed.*** Disabling Routes ***");
            }
        });


        //qh.getAllNotifications(function(err,res){
              //      for (val in res)                   {
              //          ph.setCustomTimeout(res[val]);
              //      }
              //  });
    }) ;


module.exports = app;
