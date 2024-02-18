
const express = require('express');
const { profileMulter } = require('../../utils/profileMulter');
const { uploadProfile, saveProfile, getProfile } = require('../controller/profileController');
const { authAdmin } = require('../middleware/adminTokenVal');
const router = express.Router()



router.route('/save/profile/details').post(authAdmin,saveProfile)
router.route('/get/profile/details').get(authAdmin,getProfile)
router.route('/upload/profile/logo').post( authAdmin,profileMulter.single('profile'),uploadProfile)




module.exports = router