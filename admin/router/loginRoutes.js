const { adminLogin , adminLogout, adminRegister } = require('../controller/loginController');

const express = require('express');
const { authAdmin } = require('../middleware/adminTokenVal');
const router = express.Router()



router.route('/login').post(adminLogin)
router.route('/logout').get(authAdmin,adminLogout)
router.route('/register').post(adminRegister)




module.exports = router