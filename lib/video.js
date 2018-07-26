const process = require('child_process');
exports.reduceQuality = function (input, output) {
    return new Promise((resolve, reject) => {
        try {
            var command = 'ffmpeg -i ' + input + ' -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k -movflags +faststart -vf scale=-2:720,format=yuv420p ' + output;
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