const process = require('child_process');
exports.reduceQuality = function (input, output) {
    return new Promise((resolve, reject) => {
        try {
            var command = 'ffmpeg -i ' + input + ' -b 1M -vcodec mpeg1video -acodec copy ' + output;
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