const ffmpeg = require('ffmpeg');
exports.reduceQuality = function (input, output, frames) {
    return new Promise((resolve, reject) => {
        try {
            let process = new ffmpeg(input);
            if (!frames) {
                frames = 15;
            }
            process.then((video) => {
                video
                    .setVideoFrameRate(frames)
                    .save(output, function(err, file) {
                        if (!err) {
                            resolve();
                        } else {
                            reject(err)
                        }
                    });
            }, (err) => {
                reject(err)
            });
        } catch (e) {
            reject(e)
        }
    })
};