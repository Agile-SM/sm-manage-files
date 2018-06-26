const multer = require('multer'),
    path = require('path');
var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './.tmp');
    },
    filename: function(req, file, callback) {
        callback(null, file.originalname);
    }
});
module.exports = {
    uploadMultimedia: multer({
        storage: storage,
        limits: {
            fieldNameSize: 1 * 1024 * 1024,
            fileSize: 50 * 1024 * 1024 // 50MB
        }
    }).single('file'),
}