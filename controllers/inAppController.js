/**
 * Created by harihar on 18/03/16.
 */

var fse = require('fs-extra');
var formidable = require('formidable');
var path = require('path');

var inAppProducts = require('../database/models/InAppProducts.js');
var inAppVersion = require('../database/models/inAppVersion.js');
var httpCallsHandler = require('../controllers/httpCallsHandler.js');
var httpCallsConfig = require('../config/httpCallsConfiguration.js');
var logger = require('../logger/logger.js').getLogger('inAppController');

var temp_path;
var uploadPath;

function saveIAP(request , cb) {

    processIncomingFormData(request, function (err, formData) {


        if (err) {
            logger.error('err-->', err);
        }
        else {

            var inApp = new inAppProducts();
            var inappid = inApp._id;
            var imageUrl = 'uploads/inapp/' + inappid + '.' + getFileExtension(temp_path);

            inApp.price = formData.iAPPrice;
            inApp.priority = formData.iAPIndex;
            inApp.currency = '$';
            inApp.type = formData.iAPType;
            inApp.reference_inappid = formData.iAPId;
            inApp.reference_name = formData.iAPName;
            inApp.rewarded_amount = formData.iAPAmount;
            inApp.most_popular = formData.mostpopular || false;
            inApp.percentage = formData.iAPPercentage ;
            inApp.unit = 'Coin';
            inApp.created_at = new Date();
            inApp.updated_at = new Date();

            uploadFile(temp_path, imageUrl);

            inAppProducts.findOne({most_popular: true},function (err, result) {
                if (err)
                    cb(err, null);
                else if (result) {
                    if(formData.mostpopular) {
                        result.most_popular = false;
                        result.save(function (err, queryResult) {
                            if (err)
                                cb(err, null);
                            else
                                logger.info("Most Popular in-app record updated.Tranx-id : ", queryResult._id);
                        });
                    }
                }
                inApp.save(function (err, queryOutput) {
                    if (err) {
                        logger.error("Error saving new in-app to database ", err);
                        removeFile(temp_path);
                        removeFile(imageUrl);
                        cb(err, null);
                    }
                    else {
                        logger.info("New in-app successfully saved to db.Tranxn-id : ", queryOutput._id.toString());
                        updateInAppVersion(function(err,result){
                            if(err){
                                cb(err, null);
                            }
                            else {
                                logger.info('In-App version updated.Tranxn-id : ',result._id.toString());
                                cb(null, queryOutput);
                            }
                        });

                    }
                });

            });
        }
    });
}
module.exports.saveIAP = saveIAP;



function getAllIAPs(cb){
    inAppProducts.find({}).sort({priority:1}).exec(function(err, queryOutput){
        if (err) {
            logger.error("Unable to fetch iAppList from db ", err);
            cb(err,null);
        }
        else {
            //console.info("\niAppList List :\n " ,queryOutput);
            inAppVersion.findOne({},function(err,iAPversion){
                if(err){
                    cb(err,null);
                }
                else {
                    var inappversion = '0.0';
                    if(iAPversion)
                        inappversion = iAPversion.version;
                    cb(null,{"inAppList" : queryOutput ,"inAppVersion": inappversion});
                }
            })

        }
    });
}
module.exports.getAllIAPs = getAllIAPs;



function deleteIAP(request,cb) {
    var inappid = request.body.inappid;

    inAppProducts.remove({_id: inappid}, function (err, data) {
        if (err) {
            cb(err, {'status': 500});
        }
        else {
            getFileWithFilename(__dirname +'/../uploads/inapp',inappid,function(err,file){
                if(!err){
                    fse.remove(__dirname +'/../uploads/inapp/'+file, function (err) {
                        if (err) {
                            cb(null, {'status': 500});
                        }
                        else{
                            //console.log('file removed successfully!');
                            updateInAppVersion(function(err,result){
                                if(err){
                                    cb(err, {'status':500});
                                }
                                else {
                                    //console.log('InApp version updated !!!')
                                    cb(null,{'status': 200});
                                }
                            });
                        }

                    });
                }
                else{
                    cb(null, {'status': 500});
                }
            });

        }

    });
}
module.exports.deleteIAP = deleteIAP;



function  processIncomingFormData(request,cb) {

    var form = new formidable.IncomingForm();
    var fields = {};
//set attributes

    form.keepExtensions = true;

    uploadPath = path.join(path.resolve(__dirname + '/../uploads/inapp/'), '/');
    //console.info('\nUpload Path ', uploadPath);
    form.uploadDir = uploadPath;

    form.on('aborted', function (err) {
        logger.error("File upload  ABORTED by user");
    });

    form.on('error', function (err) {
        logger.error("Error precessing in-app form received", err);
        cb(err,null);

    });

    form.on('field', function (field, value) {
        // console.log(field, value);
        if (field != 'submit') {

            if (!fields[field])
                fields[field] = value;
            else {
                if (fields[field].constructor.toString().indexOf("Array") > -1) { // is array
                    fields[field].push(value);
                } else { // not array
                    var tmp = fields[field];
                    fields[field] = [];
                    fields[field].push(tmp);
                    fields[field].push(value);
                }
            }
        }
    });


    form.on('end', function () {

        /* Temporary location of our uploaded file */
        temp_path = this.openedFiles[0].path;
        /* The file name of the uploaded file */
        var file_name = this.openedFiles[0].name;
        /* Location where we want to copy the uploaded file */
       // var new_location = uploadPath + file_name;
       // console.log("\nnew location", new_location);

        //check for valid file upload
        if(file_name) {
            var extension = getFileExtension(file_name);

            if ((extension.localeCompare("jpeg") != 0) && (extension.localeCompare("jpg") != 0) && (extension.localeCompare("png") != 0)) {
                logger.error("Media uploaded by in-app form is not of preferred type : ", extension);
                form.emit('error', new Error("Invalid Media type uploaded"));
                removeFile(temp_path);
            }

        }
        //console.log('\nfields == >\n ', fields);
        cb(null, fields);

    });

    form.parse(request);
}



function updateIAP(request , cb) {

    processIncomingFormData(request,function (err, formData) {


        if (err) {
            logger.error('Error processing in-app form', err);
        }
        else {


            var updateForInapp = formData.inappid;
            var imageUrl = 'uploads/inapp/' + updateForInapp + '.png';
            var isImgSet = formData.isImgSet;
           // console.log(updateForInapp, isImgSet);
           // console.log(typeof  isImgSet);
            if (isImgSet == 'true') {

                removeFile(imageUrl);
                uploadFile(temp_path, imageUrl);
            }

            //check if any inapp is set to most-popular
            if(formData.mostpopular ){
                inAppProducts.findOne({most_popular: true},function (err, result) {
                    if (err)
                        logger.error("Error finding most popular record",err.stack);
                    else if (result) {

                        inAppProducts.update({_id :result._id}, {most_popular: false}, function (err, queryResult) {
                            if (err)
                                logger.error("Error updating in-app with most popular tag",err.stack);
                            else
                                logger.info("In-app with most popular tag successfully updated. ");
                        });
                    }}
                );
            }



            inAppProducts.update({_id: updateForInapp},
                {
                    price: formData.iAPPrice,
                    priority: formData.iAPIndex,
                    type: formData.iAPType,
                    reference_inappid: formData.iAPId,
                    reference_name: formData.iAPName,
                    rewarded_amount: formData.iAPAmount,
                    percentage : formData.iAPPercentage,
                    most_popular: formData.mostpopular || false,
                    updated_at: new Date()
                }, function (err, queryResult) {

                    if (err)
                        cb(err, null);
                    else {
                        logger.info("InApp with id: " + updateForInapp + " Updated.");
                        updateInAppVersion(function(err,result){
                            if(err){
                                cb(err, null);
                            }
                            else {
                                logger.info('In-App version updated ',result._id.toString());
                                cb(null,queryResult);
                            }
                        })

                    }
                });

        }
    });
}
module.exports.updateIAP = updateIAP;


function updateInAppVersion(cb){
    inAppVersion.findOne(function(err,iapversion){
        var lastIAPVersion;
        if(iapversion) {
            lastIAPVersion = iapversion.version;
            iapversion.version  = (parseFloat(lastIAPVersion) + 1.0).toFixed(1);
            iapversion.save(function(err,result){
                if(err){
                    logger.error("Error updating inapp version");
                    cb(err,null);
                }
                else{
                    logger.info("InappVersion updated ",JSON.stringify(iapversion));
                    cb(null,iapversion);
                }
            })
        }
        else
        {
            var inappversion = new inAppVersion();
            inappversion.version = '0.0';
            inappversion.save(function(err,result){
                if(err){
                    logger.info("Error updating inapp version");
                    cb(err,null);
                }
                else{
                    logger.info("InappVersion updated ",JSON.stringify(iapversion));
                    cb(null,iapversion);
                }
            })

        }

    });
    notifyInAppVersionUpdated();
}


function notifyInAppVersionUpdated(){

    var dataToSend = {"requestType": httpCallsConfig.IN_APP_VERSION_UPDATED};     // InApp version updated
    httpCallsHandler.makeHttpRequest(dataToSend, 'post', function (err, response) {
        if (err) {
            logger.error('Error occurred with in-app http request ', err);
        }
        else {
            logger.info('Http post for InApp version update was successful.Response code = ',response.statusCode );
        }
    });
}



//****************  Helper functions *****************

function removeFile(filepath) {
    logger.info("Removing temporary file at ", filepath);

    fse.ensureFile(filepath, function (err) {
        if (err) {
            logger.error("No temp file exist...");
            return;
        }
        else {
            fse.remove(filepath, function (err) {
                if (err)
                    return console.error(err);
                else
                    return console.log('Temporary file removed successfully !')
            });
        }

    });
}

function getFileExtension(filename){
    var extension = filename.split('.').pop().toString();
    logger.info('uploaded file extension = ', extension);

    return extension;
}

function uploadFile(temp_path,new_location){
    
    fse.copy(temp_path, new_location, function (err) {
        if (err) {
            logger.error(err);
            return;
        }
        else{
            logger.info("file successfully copied");
        }
        removeFile(temp_path);
    });
}

function getFileWithFilename(pathToDir, filename,cb) {
    var items = [] // files, directories, symlinks, etc
    var fileFound = false ;
    var file ;
    fse.walk(pathToDir)
        .on('data', function (item) {
            items.push(item.path);
        })
        .on('end', function () {
            console.dir(items); // => [ ... array of files]
            for(var i in items) {
                file = items[i].split('/').pop();
                var name = file.split('.');
                if (filename === name[0]) {
                    fileFound = true;
                    break;
                }
            }

            if(fileFound)
                cb(null, file);
            else
                cb(new Error('File not found'),null);

        });


}



