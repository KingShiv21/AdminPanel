const { adminLogin , adminLogout, adminRegister, sendOTP, verifyOTP, resetPassword } = require('../controller/loginController');

const express = require('express');
const { authAdmin } = require('../middleware/adminTokenVal');
const router = express.Router()


router.route('/login').post(adminLogin)
router.route('/logout').get(authAdmin,adminLogout)
router.route('/register').post(adminRegister)


// forget password
router.route('/send/otp').post(sendOTP)
router.route('/verify/otp').post(verifyOTP)
router.route('/update/password').post(resetPassword)



module.exports = router