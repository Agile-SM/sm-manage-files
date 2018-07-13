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
            '0,10', '200,10', '400,10', '600,10', '800,10', '1000,10', '1200,10', '1400,10', '1600,10', '1800,10', '2000,10',
            '0,210', '200,210', '400,210', '600,210', '800,210', '1000,210', '1200,210', '1400,210', '1600,210', '1800,210', '2000,210',
            '0,410', '200,410', '400,410', '600,410', '800,410', '1000,410', '1200,410', '1400,410', '1600,410', '1800,410', '2000,410',
            '0,610', '200,610', '400,610', '600,610', '800,610', '1000,610', '1200,610', '1400,610', '1600,610', '1800,610', '2000,610',
            '0,810', '200,810', '400,810', '600,810', '800,810', '1000,810', '1200,810', '1400,810', '1600,810', '1800,810', '2000,810',
            '0,1010', '200,1010', '400,1010', '600,1010', '800,1010', '1000,1010', '1200,1010', '1400,1010', '1600,1010', '1800,1010', '2000,1010',
            '0,1210', '200,1210', '400,1210', '600,1210', '800,1210', '1000,1210', '1200,1210', '1400,1210', '1600,1210', '1800,1210', '2000,1210',
            '0,1410', '200,1410', '400,1410', '600,1410', '800,1410', '1000,1410', '1200,1410', '1400,1410', '1600,1410', '1800,1410', '2000,1410',
            '0,1610', '200,1610', '400,1610', '600,1610', '800,1610', '1000,1610', '1200,1610', '1400,1610', '1600,1610', '1800,1610', '2000,1610',
            '0,1810', '200,1810', '400,1810', '600,1810', '800,1810', '1000,1810', '1200,1810', '1400,1810', '1600,1810', '1800,1810', '2000,1810',
            '0,2010', '200,2010', '400,2010', '600,2010', '800,2010', '1000,2010', '1200,2010', '1400,2010', '1600,2010', '1800,2010', '2000,2010',
        ];
        var g = gm(readStream);
        points.forEach(function(p){
            g.draw(['image Over ' + p + ' 200,200 "' + data.mosaicWatermark + '"']);
        });

        let output = path.resolve('./.tmp/' + data.watermarkFileName);
        g.resize(data.resize, data.resize)
            .quality(data.quality)
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