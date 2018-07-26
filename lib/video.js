const process = require('child_process');
exports.reduceQuality = function (input, output) {
    return new Promise((resolve, reject) => {
        try {
            var command = 'ffmpeg -i ' + input + ' -vcodec libx264 -crf 23 -vf "scale=iw/2:ih/2" ' + output;
            console.log("EL COMMAND", command)
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