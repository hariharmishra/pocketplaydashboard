/**
 * Created by harihar on 26/05/16.
 */


var ratingAndFeedback = require('../database/models/ratingAndFeedback.js');
var logger = require('../logger/logger.js').getLogger('ratingAndFeedbackHandler');



var saveRatingAndFeedback = function saveRatingAndFeedback(request,response){
//check if user has rated before , if yes , update it else save it .

    var userId = request.body.userid;
    var rating = request.body.rating;
    var feedback = request.body.feedback;

    if(!userId || (rating <=0 || rating >5 )){
        response.send({
            'status': 403,
            'message': 'Invalid data received',
            'data': null
        });
        response.end();
        return;
    }

    ratingAndFeedback.findOne({user_id:userId},function(error, result){
        if(error){
            response.send({
                'status': 500,
                'message': 'Internal server error',
                'data': null
            });
            response.end();
        }else{
            if(result){
                // Record exists , UPDATE it
                if(rating !== result.rating){
                    result.rating = rating;
                }
                if(feedback){
                    result.feedbacks.push({"message":feedback});
                }

                result.save(function(error,success){
                    if(error){
                        logger.error("Error updating app rating ",error);
                        response.send({
                            'status': 500,
                            'message': 'Internal server error',
                            'data': null
                        });
                        response.end();
                    }else{
                        logger.info("app rating updated");
                        response.send({'status': 200, 'message': 'successfull'});
                        response.end();
                    }

                });


            }else{
                // Create New Record

                var newRating = new ratingAndFeedback();

                newRating.user_id = userId;
                newRating.rating = rating;

                if(feedback){
                    newRating.feedbacks.push({"message":feedback});
                }

                newRating.save(function(error,success){
                    if(error){
                        logger.error("Error saving app rating ",error.stack);
                        response.send({
                            'status': 500,
                            'message': 'Internal server error',
                            'data': null
                        });
                        response.end();
                    }else{
                        logger.info("New app rating saved");
                        response.send({'status': 200, 'message': 'successfull'});
                        response.end();
                    }

                });
            }
        }
    });
}
module.exports.saveRatingAndFeedback = saveRatingAndFeedback;