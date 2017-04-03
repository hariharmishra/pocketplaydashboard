/**
 * Created by harihar on 11/06/16.
 */

var subscriber = require('../database/models/subscriber');
var logger = require('../logger/logger.js').getLogger('publicSiteDao');

var addSubscriber = function (email,cb){

    subscriber.findOne({email:email},function(err,res){
        if(err){
            cb(err,null);
        }else{
            if(res){
                if(res.is_subscribed === false) {
                    res.is_subscribed = true;
                    res.save(function (err, done) {
                        if (err) {
                            cb(err, null);
                        } else {
                            cb(null, true);
                        }
                    });
                }else{
                    // email is already subscribed
                    cb(null,false);
                }
            }else{
                // add email to subscribers list
                var newSubscriber = new subscriber({email:email});
                newSubscriber.save(function(err,saved){
                    if(err){
                        cb(null,false);
                    }else{
                        cb(null,true);
                    }
                });
            }
        }
    });
};


var removeSubscriber = function(email,cb){
    subscriber.findOne({email:email},{is_subscribed:1},function(err,res){
        if(err){
            cb(err,null);
        }else{
            if(res){
                // email is subscribed, unsubscribe it
                if(res.is_subscribed === true) {
                    res.is_subscribed = false;

                    res.save(function (err, done) {
                        if (err) {
                            cb(err, null);
                        } else {
                            cb(null, true);
                        }
                    });
                }else
                    cb(null,false);

            }else{
                // no email to un-subscribe
                cb(null,false);
            }
        }
    });
};




module.exports.addSubscriber = addSubscriber;
module.exports.removeSubscriber = removeSubscriber;