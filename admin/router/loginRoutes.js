const { adminLogin , adminLogout } = require('../controller/loginController');

const express = require('express')
const router = express.Router()



router.route('/login').post(adminLogin)
router.route('/logout').get(adminLogout)




module.exports = router