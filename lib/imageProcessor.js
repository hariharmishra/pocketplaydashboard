var im=require('imagemagick');

function resizeImage(input,output,w,cb){
    console.log("RESIZING Image "+input+" TO "+output);
    getImageHeight(input,function(err,height){
        if(height<w){
            w=height;
        }
        console.log("RESIZING inside "+input+" TO "+output);
        var options = {
            width: w,
            height: w,
            srcPath: input,
            dstPath: output,
            quality: 1.0
        };
        im.resize(options, function(err, stdout, stderr) {
          //  console.log('im.resize(options, function(err, stdout, stderr) ' + err + "  " + stdout + "  " +stderr);
            if(err) {
                console.log(err);
                throw err;
            }
            else{console.log('image resized successfully');}
            cb();
        });
    });
}

function getImageHeight(image,cb){

    console.log("getImageHeight "+image);
    im.identify(image, function(err, features){
        if (err)
            console.log(err);
       // console.log(features);
        cb(err,features.height);
        // { format: 'JPEG', width: 3904, height: 2622, depth: 8 }
    });
}

exports.resizeImage=resizeImage;
