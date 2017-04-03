/**
 * Created by harihar on 08-05-2016.
 */
var env = require('./env');
var mongo = require('./mongo-config');

var scheme = {
    name   : 'redis-mongo',
    options: {
        'default': true,
        db       : {
            host: mongo.host,
            port: mongo.port,
            db: mongo.db_name,
            auth: {
                active: mongo.auth_on,
                db: mongo.auth_db,
                user: mongo.user, pass: mongo.pwd
            },
            loglevel: 'info',
            poolSize: 10
        },

        cache: {
            loglevel: 'info', poolSize: 10,
            cluster : false,
            nodes   : [
                {host: env.host, port: 6379}
            ]
        }
    }
};

module.exports = scheme;