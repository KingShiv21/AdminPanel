const multer = require('multer')

const storage = multer.memoryStorage()

const fileFilter = (req,file,cb) =>{

    const allowedExtensions = ['.png', '.jpg', '.jpeg'];
    const fileExtension = file.originalname?path.extname(file.originalname) : '';
  
    if (
      allowedExtensions.includes(fileExtension.toLowerCase()) &&
      !file.originalname.match(/\.[^.]*\./)
    ) {
      cb(null, true);
    } else {
      cb(new CreateError("FileValError", "Only PNG, JPG, and JPEG images are allowed"));
    }


}

const profileMulter  = multer({
    storage,
    fileFilter
})

module.exports = {profileMulter}