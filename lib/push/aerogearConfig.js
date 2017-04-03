
function initialize() {
var setup =
    {
        applicationId: "ce27b2cc-916a-4b45-8408-aa85db616aa1", masterSecret: "015423ff-8ad6-4774-b71c-c4da999edbed",
            appId: 'pp_prod', name: 'PP SDK'
    }
    setup.url = 'http://pocketplay-unipush.rhcloud.com/ag-push';

    console.log('Initializing with ', setup);
    return setup;
}


module.exports = initialize();




