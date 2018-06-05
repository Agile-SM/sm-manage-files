let async = require('async'),
    fs = require('fs'),
    context = require('web-audio-api');
let audioContext = context.AudioContext;
let ctx = new audioContext();

exports.createWatermark = function (file, watermark_file, originalname, watermark, ext) {
    return new Promise((resolve, callback) => {
        let files = [file, watermark_file];
        async.map(files, function(file, callback) {
            let data = fs.readFileSync(file);
            let arrayBuffer;
            if (data.byteOffset === 0 && data.byteLength === data.buffer.byteLength) {
                arrayBuffer = data.buffer;
            } else {
                arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
            }
            ctx.decodeAudioData(arrayBuffer, function(success) {
                return callback(null, success)
            })

        }, function(error, result) {
            let maxDuration = _maxDuration(result);
            let output = ctx.createBuffer(1, 44100 * maxDuration, 44100);
            let songLength;
            async.map(result, function(buffer, callback) {
                for (let i = buffer.getChannelData(0).length - 1; i >= 0; i--) {
                    output.getChannelData(0)[i] += buffer.getChannelData(0)[i];
                }
                if (buffer.duration < maxDuration) {
                    let lastDuration = buffer.getChannelData(0).length;
                    let silence = 300000;
                    let array = [lastDuration + 75000, lastDuration + 150000];
                    while (silence <= songLength) {
                        array.push(lastDuration + silence);
                        silence += 100000;
                    }
                    for (let i = buffer.getChannelData(0).length - 1; i >= 0; i--) {
                        for (let item in array) {
                            if (output.getChannelData(0)[(array[item] * 2) + i]) {
                                output.getChannelData(0)[(array[item] * 2) + i] += buffer.getChannelData(0)[i];
                            }
                        }
                    }
                } else {
                    songLength = buffer.getChannelData(0).length;
                }
                return callback(null, output);
            }, function(error, outputValues) {
                let output = outputValues[1];
                let recorded = _interleave(output);
                const dataview = _writeHeaders(recorded);
                let watermarName = originalname + `-watermark-${watermark}${ext}`;
                let path = './.tmp/' + watermarName;
                fs.writeFile(path, new Buffer(dataview.buffer), "binary", function(err) {
                    resolve(path);
                });
            })
        })
    })
};
function _maxDuration(buffers) {
    let durations = [];
    buffers.forEach(function(buffer) {
        durations.push(buffer.duration);
    });
    return Math.max.apply(Math, durations)
}

function _interleave(input) {
    let buffer = input.getChannelData(0),
        length = buffer.length * 2,
        result = new Float32Array(length),
        index = 0,
        inputIndex = 0;

    while (index < length) {
        result[index++] = buffer[inputIndex];
        result[index++] = buffer[inputIndex];
        inputIndex++;
    }
    return result;
}

function _writeHeaders(buffer) {
    let arrayBuffer = new ArrayBuffer(44 + buffer.length * 2),
        view = new DataView(arrayBuffer);

    _writeString(view, 0, 'RIFF');
    view.setUint32(4, 32 + buffer.length * 2, true);
    _writeString(view, 8, 'WAVE');
    _writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 2, true);
    view.setUint32(24, 44100, true);
    view.setUint32(28, 44100 * 4, true);
    view.setUint16(32, 4, true);
    view.setUint16(34, 16, true);
    _writeString(view, 36, 'data');
    view.setUint32(40, buffer.length * 2, true);

    return _floatTo16BitPCM(view, buffer, 44);
}

function _floatTo16BitPCM(dataview, buffer, offset) {
    for (let i = 0; i < buffer.length; i++, offset += 2) {
        let tmp = Math.max(-1, Math.min(1, buffer[i]));
        dataview.setInt16(offset, tmp < 0 ? tmp * 0x8000 : tmp * 0x7FFF, true);
    }
    return dataview;
}

function _writeString(dataview, offset, header) {
    for (let i = 0; i < header.length; i++) {
        dataview.setUint8(offset + i, header.charCodeAt(i));
    }
}