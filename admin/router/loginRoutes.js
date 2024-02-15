import { adminLogin } from '../controller/loginController';

const express = require('express')
const router = express.Router()



router.route('/login').post(adminLogin)
router.route('/logout').get()




export default router;