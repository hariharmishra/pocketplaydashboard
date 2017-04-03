

var http = require('https');
var config = require('./aerogearConfig');
var auths = {'pp_prod': '5c15641a-780c-42f4-b796-248761f5434c:733cc86d-91fa-486f-9a57-0fe5f3179b3e'};



var device = getInstalltion('APA91bGOmK80JP00eP_rcEwvuP_DnX6o-C18EANacsIfQCjkkaKrbu88tqTCC2XrQgHzPvyjMzbOub3cr6RB41p2a7OdGBxpOkRMQe5jfmL_gRNm_xhoUvxcoVsSxPaPdXuM6V0A5enE' , 'nikhil');



function register_installation(registration, installation, cb) {

    var auth = auths[registration];
    if(!auth) {
        return cb('No variant found for: ' + registration);
    }

    var data = JSON.stringify(installation);
    var options = {};
    options.host = 'pocketplay-unipush.rhcloud.com';
    options.port = 443;
    options.method = 'POST';
    options.path = '/ag-push/rest/registry/device'; //rest/registry/device
    options.auth = auths[registration];
    console.info('auth : '+ auths[registration]);
    options.keepAlive = true;
    options.headers = {'Content-Type': 'application/json', 'Content-Length': data.length};

    var req = http.request(options, function(res) {
        console.info('PUSH-REGISTER', registration, installation.alias, '> Response:', res.statusCode);
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            console.info('PUSH-REGISTER: Registration complete', installation.alias);
        });

        if(res.statusCode == 200) {
            installation.variant = auths[registration].split(':')[0];
            cb(null, installation);
        } else {
            cb('Invalid Status code: ' + res.statusCode + ' - ' + res.status);
        }
    });

    req.on('error', function(e) {
        console.error('PUSH-REGISTER', registration, installation.alias, '> problem with request: ', e.message, e);
    });

// write data to request body
    req.write(data);
    req.end();
}

function getInstalltion(token, alias) {
    return {
        deviceType           : 'mobile',
        operatingSystem       : 'android', // iOS, android, windows, weird
        osVersion: '4.2',

        deviceToken    : token,
        alias                 : alias,
        categories  : []
    }
}



//register_installation('pp_prod', device, function(a,b) {
//    console.log('registration done: ', a, b);
//})

require('./aerogearSender').send_to_users('nikhil', 'hello', '4444', 'TEST', function(e, s) {
    console.log(e, s)
});