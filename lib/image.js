const Exif = require('exif').ExifImage;
const fs = require('fs');
const sizeOf = require('image-size');
const gm = require('gm').subClass({
    imageMagick: true
});
exports.getMetadata = function (data) {
    return new Promise((resolve, reject) => {
        new Exif({
            image: './.tmp/' + data.file.filename
        }, function(err, exifData) {
            const stats = fs.lstatSync('./.tmp/' + data.file.filename);
            var dimensions = sizeOf('.tmp/' + data.file.filename);
            if (exifData) {
                exifData.otherData = {
                    sizeInMB: stats.size / 1000000.0,
                    dimensions: dimensions
                };
                resolve({
                    code: 'SUCCESS_UPLOAD_FILE',
                    filename: data.file.filename,
                    metadata: exifData
                })
            } else {
                const metadata = {
                    otherData: {
                        sizeInMB: stats.size / 1000000.0,
                        dimensions: dimensions
                    }
                };
                resolve({
                    code: 'SUCCESS_UPLOAD_FILE',
                    filename: data.file.filename,
                    metadata: metadata
                })
            }
        })
    })
}

exports.createWatermark = function (data) {
    return new Promise((resolve, reject) => {
        let readStream = fs.createReadStream('./.tmp/' + data.filename);
        gm(readStream)
            .resize(data.resize, data.resize)
            .quality(data.quality)
            .gravity(data.gravity)
            .stroke(data.stroke)
            .fontSize(data.fontSize)
            .drawText(0, 0, `${data.nameShot}`)
            .gravity(data.nameShotGravity)
            .draw(data.watermarkPath)
            .stream(function (err, stdout, stderr) {
                let writeStream = fs.createWriteStream('./.tmp/' + data.watermarkFileName);
                stdout.pipe(writeStream);
                writeStream.on('finish', function() {
                    resolve(writeStream);
                })
            })
    })
}