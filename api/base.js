var express = require('express');
var router = express.Router();

var multer = require('multer')
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    var ex = file.originalname.replace(/^.{1,}\./g, '')
    cb(null, file.fieldname + '-' + Date.now()+ '.' + ex)
  }
})

var upload = multer({ dest: 'uploads/', storage: storage })
var fs = require('fs')
var path = require('path')
/* GET home page. */
router.post('/upload', upload.single('file'), function (req, res, next) {
  res.json({
    ok: true,
    file: req.file
  });
});
module.exports = router;
