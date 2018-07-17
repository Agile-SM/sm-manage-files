const Exif = require('exif').ExifImage;
const fs = require('fs');
const path = require('path');
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
    if (data.mosaic) {
        const points = [
            '0,10', '150,10', '300,10', '450,10', '600,10', '750,10', '900,10', '1050,10', '1200,10', '1350,10', '1500,10',
            '0,160', '150,160', '300,160', '450,160', '600,160', '750,160', '900,160', '1050,160', '1200,160', '1350,160', '1500,160',
            '0,310', '150,310', '300,310', '450,310', '600,310', '750,310', '900,310', '1050,310', '1200,310', '1350,310', '1500,310',
            '0,460', '150,460', '300,460', '450,460', '600,460', '750,460', '900,460', '1050,460', '1200,460', '1350,460', '1500,460',
            '0,610', '150,610', '300,610', '450,610', '600,610', '750,610', '900,610', '1050,610', '1200,610', '1350,610', '1500,610'
        ];
        var g = gm(readStream);
        g.resize(data.resize, data.resize)
        points.forEach(function(p){
            g.draw(['image Over ' + p + ' 150,150 "' + data.mosaicWatermark + '"']);
        });

        let output = path.resolve('./.tmp/' + data.watermarkFileName);
        g.quality(data.quality)
            .gravity(data.gravity)
            .stroke(data.stroke)
            .fontSize(data.fontSize)
            .drawText(0, 0, `${data.nameShot}`)
            .gravity(data.nameShotGravity)
            .write(output, function (err, stdout, stderr) {
                if (!err) {
                    resolve(output);
                } else {
                    reject(err);
                }
            });
    } else {
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
    }
})
}