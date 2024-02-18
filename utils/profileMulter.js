const multer = require('multer')
const path = require('path');
const { CreateError } = require('./trycatchclass');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname,'..','public','profile'))
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, Date.now()+ '-' + file.originalname)
  }
})

const fileFilter = (req,file,cb) =>{

  try {
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
  
  catch (error) {
     console.log(error)
     throw new CreateError("FileValError", "Error in multer from server")
  }



}

const profileMulter  = multer({
    storage,
    fileFilter
})

module.exports = {profileMulter}