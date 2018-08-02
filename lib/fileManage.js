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
        "video/3gpp",
        "audio/wave",
        "audio/mpeg",
        "audio/mp3",
        "audio/3gpp",
        "audio/wav",
        "audio/x-wav",
        "audio/x-pn-wav"
    ];

class FILE {
    initialize(data, res, cosData) {
        let uploadMethod = 'uploadMultimedia';
        if (data.body && data.body.multiple) {
            uploadMethod = 'uploadMultimediaArray';
        }
        if (cosData) {
            this.COS = new SM_COS(cosData)
        }
        return new Promise((resolve, reject) => {
            upload[uploadMethod](data, res, function (error) {
                if (error) {
                    reject(error);
                } else if (!data.files && uploadMethod === 'uploadMultimediaArray') {
                    reject({code: 404, msg: 'NOT_PERMISSION'});
                } else if (!data.file && uploadMethod === 'uploadMultimedia') {
                    reject({code: 404, msg: 'NOT_PERMISSION'});
                } else {
                    let permission = true;
                    if (data.files) {
                        for(let i =0; i < data.files.length; i++) {
                            if (!_.includes(formates, data.files[i].mimetype)) {
                                permission = false;
                            }
                        }
                    } else {
                        if (!_.includes(formates, data.file.mimetype)) {
                            permission = false;
                        }
                    }

                    if (permission) {
                        if (data.files) {
                            let filenames = [];
                            for (let i =0; i < data.files.length; i++) {
                                filenames.push(data.files[i].filename)
                            }
                            resolve(filenames);
                        } else {
                            resolve(data.file.filename);
                        }
                    } else {
                        reject({code: 404, msg: 'NOT_PERMISSION'});
                    }
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
            let data = {};
        // Callback mode
        ffmpeg.ffprobe(file, function (err, metadata) {
            if (metadata) {
                data = metadata;
                data.info = video.metadata;
                if (data.info) {
                    data.info.otherData =  {
                        size: stats.size / 1000000.0
                    }
                }
            } else {
                data.info = video.metadata;
                if (data.info) {
                    data.info.otherData =  {
                        size: stats.size / 1000000.0
                    }
                }
            }
            resolve(data);
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
