/**
 * Created by Nikhil on 06/05/16.
 */

var https = require('https');
const NEXMO_API_KEY = 'a486cd10';
const NEXMO_API_SECRET = '54d8e7fbd4395749';

var data = JSON.stringify({
    api_key: NEXMO_API_KEY,
    api_secret: NEXMO_API_SECRET,
    to: '918587855851',
    from: '918586054045',
    text: 'Hello from NIKHIL BHOLA'
});

var options = {
    host: 'rest.nexmo.com',
    path: '/sms/json',
    port: 443,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

var req = https.request(options);

req.write(data);
req.end();

var responseData = '';
req.on('response', function(res){
    res.on('data', function(chunk){
        responseData += chunk;
    });

    res.on('end', function(){
        console.log(JSON.parse(responseData));

        //Decode the json object you retrieved when you ran the request.

        var decodedResponse = JSON.parse(responseData);

        console.log('You sent ' + decodedResponse['message-count'] + ' messages.\n');

        decodedResponse['messages'].forEach(function(message) {
            if (message['status'] === "0") {
                console.log('Success ' + decodedResponse['message-id']);
            }
            else {
                console.log('Error ' + decodedResponse['status']  + ' ' +  decodedResponse['error-text']);
            }
        });
    });
});



