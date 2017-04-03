var fs = require('fs-extra');
var _ = require('underscore');

// Argument parsing using the optimist module
var opts = require('optimist')
    .usage('Usage: $0 --environment [env]')
    .alias('environment', 'e').default('environment', 'local').describe('environment', 'Environment to use')
    .argv;

var envToExport;

// load env specific config
var defaultEnvFile = './all/env.js';

var defaultEnv = require(defaultEnvFile);
var environment;
environment = opts.environment;
environment = environment === 'qa' ? 'uat1' : environment;
var envFile = environment + '/env.js';

console.log('Loading environment:', environment, 'from', 'config/' + envFile);

var env = require('./' + envFile);

_.extend(defaultEnv, env);
// do not return aliases
envToExport = _.omit(defaultEnv, function(val, key, obj) {
    return key.length == 1 || key === '$0';
});

var toLoad = {};
getkeysToLoad(envToExport, toLoad);
console.log(environment, '- configurations to load', toLoad);
// get configs to load
loadConfigurations(envToExport, toLoad, environment);

var envType = 0;
if(environment === 'local') {
    envType = 0;
} else if(environment === 'qa' || environment.startsWith('uat')) {
    envType = 1;
} else {
    envType = 2;
}
envToExport.envType = envType;

// set the app name loaded
envToExport.instance = envToExport.name + '-' + envToExport.host + ':' + envToExport.port;

console.log(environment, '- Environment loaded');
 //console.log(envToExport);


function getkeysToLoad(env, toLoad) {
    _.keys(env).forEach(function(key) {
        var val = envToExport[key];
        if(typeof val === 'string') {
            if(val.endsWith('.js')) {
                toLoad[key] = val;
            }
        } else if (typeof val === 'object') {
            getkeysToLoad(val, toLoad);
        }
    })
}

function loadConfigurations(envOpts, toLoad, env) {
    _.keys(toLoad).forEach(function(key) {
        envOpts[key] = tryFile(toLoad[key], env);
    });
}

function tryFile(fileName, env) {
    var e;
    try {
        e = require('./' + env + '/' + fileName);
        console.log(env, '- Loaded configuration from', env + '/' + fileName);
        return e;
    } catch(err) {
        e = require('./all/' + fileName);
        console.log(env, '- Loaded configuration from', 'all/' + fileName);
        return e;
    }
}


module.exports = envToExport;

