/**
 * Created by harihar on 08/06/16.
 */

var rechargeApi = require('../database/models/rechargeApi');
var logger = require('../logger/logger.js').getLogger('rechargeApiDao');

/**
 *
 * @param objectToSaveOrUpdate
 * @param cb
 */
var saveOrUpdateTransaction = function (objectToSaveOrUpdate,cb){

    var orderId = objectToSaveOrUpdate.order_id;

    console.log('ORDER ID : ',orderId);

    rechargeApi.findOne({order_id:orderId},function(err,tranxn) {
        if (err) {
            cb(err, null);
        } else {
            if(tranxn){
                var updateObject = {};
                if(objectToSaveOrUpdate.pay_id)
                    updateObject.pay_id = objectToSaveOrUpdate.pay_id;
                if(objectToSaveOrUpdate.transaction_id)
                    updateObject.transaction_id = objectToSaveOrUpdate.transaction_id;
                if(objectToSaveOrUpdate.status)
                    updateObject.status = objectToSaveOrUpdate.status;
                if(objectToSaveOrUpdate.status_message)
                    updateObject.status_message = objectToSaveOrUpdate.status_message;

                console.log("UPDATED OBJ = ",updateObject);
                rechargeApi.update({order_id:orderId},updateObject,function(err,res){
                    if(err){
                        cb(err,null);
                    } else{
                        cb(null,true);
                    }
                });

            }else{
                console.log("save new object to db : ",objectToSaveOrUpdate)
                var newTransaction = new rechargeApi(objectToSaveOrUpdate);
                newTransaction.save(function (err,res) {
                    if(err){
                        cb(err,null);
                    } else{
                        cb(null,true);
                    }
                });
            }
        }
    });


    //
    //
    //
    //
    //
    //var payid = objectToSaveOrUpdate.payid;
    //var userid = objectToSaveOrUpdate.userid;
    //var status = objectToSaveOrUpdate.status;
    //var transaction_id = objectToSaveOrUpdate.transaction_id;
    //
    //rechargeApi.findOne({pay_id:payid,user_id:userid,status:{$ne :'success' , $ne :'failure'}},function(err,tranxn) {
    //    if (err) {
    //        cb(err, null);
    //    } else {
    //        if (tranxn) {
    //            console.log("Previous tranxn status : ", tranxn.status);
    //            tranxn.status = status;
    //            if (transaction_id)
    //                tranxn.transaction_id = transaction_id;
    //
    //            tranxn.save(function (err, res) {
    //                if (err) {
    //                    console.log("Error updating transaction log ");
    //                    cb(err, null);
    //                } else {
    //                    console.log("Transaction with payid ", payid, "with new status ", status, "successfully updated with db ");
    //                    cb(null, {"amount": tranxn.amount});
    //                }
    //            });
    //        } else {
    //            //Save this as new transaction
    //
    //            saveTransaction(objectToSaveOrUpdate, function (err, res) {
    //                if (err) {
    //                    console.log("Error updating transaction log ");
    //                    cb(err, null);
    //                } else {
    //                    console.log("Transaction with payid ", payid, "with status ", status, "successfully saved with db ");
    //                    cb(null, {"amount": tranxn.amount});
    //                }
    //            });
    //        }
    //    }
    //});
};

/**
 *
 * @param orderId
 * @param cb
 */
var getPlayerIdAndAmount = function(orderId,cb){
    console.log('Get PlayerId for orderID :',orderId);

    rechargeApi.findOne({order_id : orderId},{player_id:1,amount:1},function(err, resp){
        if(err){
            cb(err, null);
        }
        else {
            cb(null,{"player_id":resp.player_id,"amount":resp.amount});
        }
    });

};


/**
 * Module Exports
 */
module.exports.saveOrUpdateTransaction = saveOrUpdateTransaction;
module.exports.getPlayerIdAndAmount = getPlayerIdAndAmount;