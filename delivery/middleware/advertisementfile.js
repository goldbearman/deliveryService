const multer = require('multer')

const storage = multer.diskStorage({
  destination(req, file, cb){
    cb(null, 'public/download')  //(ошибка,куда сохранять файл)
  },
  filename(req, file, cb) {
    cb(null, file.originalname)
  }
})

module.exports = multer({storage})