const { tryCatch } = require("../../utils/trycatchhandler")
require('dotenv').config()

const jwt = require('jsonwebtoken')
const util = require('util')
const { CreateError } = require("../../utils/trycatchclass")
const verifyJWT = util.promisify(jwt.verify)


var authAdmin = async (req,res,next,transaction) =>{
    const bearerToken = req.header('authorization')

    if (!bearerToken) {
        throw new CreateError("TokenError", "Header is empty")
    }

    const arrToken = bearerToken.split(" ");
    if (!arrToken[1]) {
        throw new CreateError("TokenError", "Empty Token")
    }

    
    console.log(arrToken[1])
    let payload;
    try {
     payload = await verifyJWT(arrToken[1],process.env.SECRET_KEY)
     req.admin_id = payload?.admin_id
    } catch (error) {
        throw new CreateError("TokenError", error.message)
    }

    let tableToken;
    try {
        const query =await transaction('admins').select('token').where('id','=',req.admin_id).first();
        tableToken = query.token
    } catch (error) {
        throw new CreateError('TransactionError' , error.message)
    }

    if (tableToken != arrToken[1] ) {
        throw new CreateError("TokenError", "Invalid Token !")
    }

    next()



}

authAdmin = tryCatch(authAdmin)
module.exports = {authAdmin}