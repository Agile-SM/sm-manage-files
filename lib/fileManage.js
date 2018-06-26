const upload = require('./upload'),
    _ = require('lodash'),
    fs = require('fs'),
    ffmpeg = require('fluent-ffmpeg'),
    ffmepg2 = require('ffmpeg'),
    SM_COS = require('sm-cos'),
    IMAGE = require('./image'),
    AUDIO = require('./audio'),
    VIDEO = require('./video'),
    RENDERVIDEO = require('./RenderVideoServices'),

    formates = [
        "image/jpeg",
        "image/gif",
        "image/png",
        "image/jpg",
        "image/bmp",
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/ogv",
        "video/mp5",
        "audio/wave",
        "audio/mp3",
        "audio/wav",
        "audio/x-wav",
        "audio/x-pn-wav"
    ];

class FILE {
    initialize(data, res, apiCOS) {
        if (apiCOS) {
            this.COS = new SM_COS({apiKeyId: apiCOS})
        }
        return new Promise((resolve, reject) => {
            upload.uploadMultimedia(data, res, function (error) {
            if (error) {
                reject(error);
            } else if (!data.file || !_.includes(formates, data.file.mimetype)) {
                reject({code: 404, msg: 'NOT_PERMISSION'});
            } else {
                resolve(data.file.filename);
            }
        })
    })
    }

    //IMAGE
    async getImageMetadata(data) {
        return await IMAGE.getMetadata(data);
    }

    async createImageWatermark (data) {
        return await IMAGE.createWatermark(data);
    }

    //VIDEO
    async reduceQualityVideo (input, output) {
        return await VIDEO.reduceQuality(input, output);
    }

    initializeVideo (options) {
        return new RENDERVIDEO(options);
    }

    //AUDIO
    async createAudioWatermark (file, watermark_file, originalname, watermark, ext) {
        return await AUDIO.createWatermark(file, watermark_file, originalname, watermark, ext);
    }

    uploadFromTmp (file, bucket) {
        return this.COS.uploadFileFromTmp(file, bucket);
    }

    getAudioVideoMetadata(file) {
        const stats = fs.lstatSync(file);
        return new Promise((resolve, reject) => {
            var process = new ffmepg2(file);
            process.then((video) => {
            // Callback mode
                ffmpeg.ffprobe(file, function (err, metadata) {
                metadata.info = video.metadata;
                metadata.info.otherData = {
                    size: stats.size / 1000000.0
                }
                resolve(metadata);
            })

    }, (err) => {
            resolve(null);
        });
    })
    }

    cleanTmp (files) {
        setTimeout(() => {
            for (let i = 0; i < files.length; i++) {
            fs.unlink(`./.tmp/${files[i]}`, function (err) {
                if(err){
                    console.log("ERROR -> fs.unlink")
                }
            });
        }
    }, 1000)
    }
}

module.exports = FILE;
