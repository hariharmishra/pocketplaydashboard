/**
 * Created by harihar on 17/03/16.
 */
var redis = require('redis');
var constants = require('../config/constants');
var logger = require('../logger/logger.js').getLogger('redisController');
var lock;
var client;
var isRedisActive = false ;

function init(cb){

    if(constants.ENV_TYPE === 'heroku'){
        return;
    }
    logger.info("INITIATING: REDIS HANDLER ");


    if(client) {
        return;
    }

    try {
        var options = null;
        client = redis.createClient(constants.REDIS_PORT, constants.REDIS_HOST);
        lock = require('redis-lock')(client, 2000);
        isRedisActive = true ;
        cb();
    }catch(err){
        //console.error(err);
        isRedisActive = false;
        cb(err);
    }
}
exports.init = init;


function removeFromRedis(docType,id,cb) {
    if (isRedisActive) {
        client.del(docType + id, function (err) {
            //close client here
            //client.quit();
            cb(err);
        })
    }
}


exports.removeFromRedis = removeFromRedis;

function insertInRedis(docType, id, val, isWriteRequired, cb){
    console.log("INSERTING IN REDIS: "+docType+" "+id+" "+val);
    client.setnx(docType+id,strUtils.convertToString(val),function (err,res){
        if(err){
            console.error("ERROR WHILE INSERTING IN REDIS. DOCTYPE: "+docType+" ID: "+id+" VAL: "+val);
            cb(err);
        }else{
            setExpire(docType,id);
            if(isWriteRequired == true && res == 1){
                lock(docType+id,constants.redis_lock_maxTime,function(done){
                    cb(null,res, done)
                });
            }else {
                cb(null, res);
            }
        }
    });
}

exports.insertInRedis=insertInRedis;

function updateInRedis(docType, id, val, done,cb){
    if(done==null){
        console.log("UPDATE REQUEST WITHOUT LOCK REJECTED: DOCTYPE: "+docType+" ID: "+id+" VAL: "+val);
        cb("NO LOCK FOUND");
        return;
    }
    client.set(docType+id,strUtils.convertToString(val),function (err,res){
        if(err){
            console.error("ERROR WHILE INSERTING IN REDIS. DOCTYPE: "+docType+" ID: "+id+" VAL: "+val);
        }else{
            setExpire(docType,id);
        }
        if(done) done();
        cb(err);
    });
}
exports.updateInRedis=updateInRedis;

function setExpire(docType, id){
    var expTime = constants.redis_ttl[docType];
    if(expTime){
        client.expire(docType+id, expTime);
    }
}

function getLock(lockId,cb){
    console.log("LOCKING: "+lockId);
    lock(lockId,constants.redis_lock_maxTime,function(done){
        cb(done)
    });
}
exports.getLock=getLock;

function releaseLock(lockId, done,cb){
    console.log("RELEASING LOCK: "+lockId);
    done();
    if(cb)
        cb();
}

function setCustomExpire(id, time){
    if(time || time == 0){
        console.log("in redis key");
        client.expire(id, 1);
    }
}

exports.setCustomExpire = setCustomExpire;

exports.releaseLock=releaseLock;

function delete_key(id){
    client.del(id);
}
exports.del_key = delete_key;
