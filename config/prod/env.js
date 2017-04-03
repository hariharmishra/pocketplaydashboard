/**
 * Created by harihar on 08-05-2016.
 */
var opts = require('optimist')

    // default host
    .default('host', '172.31.21.196').describe('host', 'Default host to bind to. Used for all sockets created')
    .default('express.port', 8000).describe('express.port', 'Node Express port to bind to')

    .argv;

module.exports = opts;