const process = require('child_process');
exports.reduceQuality = function (input, output) {
    return new Promise((resolve, reject) => {
        try {
            var command = 'ffmpeg -i ' + input + ' -vcodec h264 -b:v 700k -acodec mp3 ' + output;

            process.exec((command), function (error, result) {
                        if (error) {
                            reject(error)
                        } else {
                            resolve();
                        }

                    });
                } catch (e) {
                    reject(e)
                }
            })
};