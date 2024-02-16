const { CreateError }= require('../../utils//trycatchclass')
const Joi = require('joi')
const { tryCatch } = require('../../utils/trycatchhandler')
require('dotenv').config()


const jwt = require('jsonwebtoken')
const util = require('util')
const bcrypt = require('bcrypt')
const signAsync = util.promisify(jwt.sign)



var adminLogin = async (req,res,next,transaction) => {

    // data validation
    const validationSchema = Joi.object({
        email: Joi.string().max(50).required(),
        password: Joi.string().max(50).required()
    })
    const {error} = await validationSchema.validateAsync(req.body)
    if (error) {
        throw new CreateError('ValidationError' , error.details[0].message)
    }
    

    const bodyData = req.body
    let hashPassword 
    let tableEmail
    let iPasssMatch

    // try catch for transaction errors and unknown error msg handling
    try {
        const query = await transaction.select('email','password').from('admins').where('email','=' ,bodyData.email).first()
        console.log("query result" , query)
        tableEmail = query?.email
        hashPassword = query?.password
    } catch (error) {
        throw new CreateError('TransactionError' , error.message)
    }

    if (bodyData.email != tableEmail) {
        res.send({
            status:0,
            message : "Invalid Email"
        })
        
    }else{

    // iPasssMatch =  bcrypt.compareSync(bodyData.password , hashPassword)
    
    

    if (bodyData.password == hashPassword) {
        const {id} = await transaction('admins').select('id').where('email','=',bodyData.email).first()


        // console.log("keyyyyyyyyyyyyyyyyy" , process.env.SECRET_KEY)
        // console.log("idddddddddddddd" , id)
        const payload = {
            admin_id : id 
        }

        const tok = await signAsync(payload,process.env.SECRET_KEY ,{
            expiresIn : '365d'
        })
        // console.log("token" , tok)
        await transaction('admins').where('id','=',id).update({
            token: tok
        })


        res.send({
            status:1,
            token : tok,
            message : "Login Successfully"
        })
        
    }else{
        res.send({
            status:0,
            message : "Password is Incorrect"
        })
    }


    }

}




var adminLogout = async (req,res,next,transaction) => {

    try {
        await transaction('admins').where('id','=',req.id).update({
            token : null
        })
    } catch (error) {
        throw new CreateError('TransactionError' , error.message)
    }
        res.send({
            status:1 ,
            message : "Logout Successfully"
        })
 
}

adminLogin = tryCatch(adminLogin)
adminLogout = tryCatch(adminLogout)
module.exports = { adminLogin , adminLogout}