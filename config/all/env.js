/**
 * Created by harihar on 08-05-2016.
 */
var opts = require('optimist')

    // Name of the node/app
    .default('name', 'DASHBOARD').describe('name', 'name of the App')

    // default host
    .default('host', '127.0.0.1').describe('host', 'Default host to bind to. Used for all sockets created')
    .default('port', 8000).describe('port', 'Default port to bind to. Used for all sockets created')
    .default('express.port', 8000).describe('express.port', 'Node Express port to bind to')

    // mongo configuration
    .default('mongo', 'mongo-config.js').describe('mongo', 'Mongo db configurations to use')

    // cluster scheme config location
    .default('scheme', 'cluster-scheme.js').describe('scheme', 'DB-CACHE scheme config to use')

    // redis scheme config location
    .default('redis', 'redis-config.js').describe('redis', 'redis config to use')

    // logging configuration
    .default('logging', 'logging-config.js').describe('logging', 'Logging configuration to use')

    // global configurations for app constants
    .default('appConfig','app-config.js').describe('app-config','Global app config to use')

    // mailers
    .default('alerts.email', 'nikhil@lambentgamestudio.com').describe('alerts.email', 'Email to send the alerts to')
    .default('mailer.name', 'Pocket Play Support Ash-System').describe('mailer.name', 'Support mailer name')

    .default('supported.version', {ANDROID: 9.0, IOS: 6.0}).describe('supported.version', 'Mobile supported versions')

    .default('db.loglevel', 'info').describe('db.loglevel', 'DB logging level to use')

    // aliases
    .alias('name', 'N')
    .alias('host', 'h')
    .alias('express.port', 'j')
    .alias('alerts.email', 'm')
    .alias('db.loglevel', 'l')
    .argv;

module.exports = opts;