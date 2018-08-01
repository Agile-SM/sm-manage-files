const ffmpeg = require('ffmpeg'),
    thumbler = require('video-thumb'),
    MediaConverter = require("html5-media-converter"),
    fs = require('fs'),
    path = require('path'),
    mc = new MediaConverter({
        videoFormats: [
            'ogv',
            'webm'
        ]
    });

class RenderVideo {
    constructor(options) {
        this.input = options.input;
        this.output = options.output;
        this.imageWatermark = options.imageWatermark;
        this.outputThumnail = options.outputThumnail;
        this.suffix = options.suffix;
        this.nameFile = options.nameFile;
        this.extension = options.extension;
        this.watermarkSizes = options.watermarkSizes;
    }

    watermarkVideo(cb) {
        watermarkProcess(this.input, this.output, {
            image: this.imageWatermark
        }, this.watermarkSizes, this.nameFile, this.suffix)
            .then(cb)
            .catch(err => console.log(err))
    }

    makeThumnail(cb) {
        let thumnail = this.outputThumnail;
        let nameFile = this.nameFile;
        let suffix = this.suffix;
        require('child_process').exec(('ffmpeg -ss 00:00:01 -i ' + this.output + ' -vframes 1 -q:v 2 ' + this.outputThumnail), function (err) {
            return createImageThumb(thumnail, nameFile, suffix).then((result) => {
                return result;
        }).then(cb);
        });
    }

    convertFormat(cb) {
        mc.convert(this.output, "300x300", path.resolve(`./.tmp`)).then(() => {
            setTimeout(() => {
            let files = [];
            files.push(`${this.nameFile}-watermark${this.suffix}.ogv`);
            files.push(`${this.nameFile}-watermark${this.suffix}.webm`);
            cb(files);
        }, 500)
    })
    }

    clear(path) {
        fs.unlink(path);
    }
}

module.exports = RenderVideo

function createImageThumb(pathThumnailVideo, nameFile, nameShot) {
    return new Promise((resolve, callback) => {
        fs.createReadStream(pathThumnailVideo);
    let fileTmpThumb = nameFile + '-thumb-watermark';
    if (nameShot) {
        fileTmpThumb += nameShot;
    }
    fileTmpThumb += '.jpg';
    resolve(fileTmpThumb)
})
}


function watermarkProcess(input, output, options, watermarkSizes, namefile, suffix) {
    return new Promise((resolve, reject) => {
        try {
            var process = new ffmpeg(input);
    process.then((video) => {
        const gm = require('gm').subClass({
            imageMagick: true
        })
        let h = watermarkSizes.h;
    let w = watermarkSizes.w;
    if (video.metadata.video.resolution.h > watermarkSizes.h && video.metadata.video.resolution.w > watermarkSizes.w) {
        video.fnAddWatermark(options.image, output, {
            position: 'C'
        }, (err, file) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        });
    } else {
        h = null;
        w = null;
        if (video.metadata.video.resolution.h < watermarkSizes.h ) {
            h = video.metadata.video.resolution.h
        }
        if (video.metadata.video.resolution.w < watermarkSizes.w ) {
            w = video.metadata.video.resolution.w
        }
        gm(options.image)
            .resize(w, h)
            .write(`./.tmp/${namefile}${suffix}-watermarkTmp.png`, function (err) {
                video.fnAddWatermark(`./.tmp/${namefile}${suffix}-watermarkTmp.png`, output, {
                    position: 'C'
                }, (err, file) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve()
                    }
                });
            });
    }
}, (err) => {
        reject(err)
    });
} catch (e) {
        reject(e)
    }
})
}
