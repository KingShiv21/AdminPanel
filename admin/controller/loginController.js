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

    iPasssMatch =  bcrypt.compareSync(bodyData.password , hashPassword)
    
    

    if (iPasssMatch) {
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


var adminRegister = async (req,res,next,transaction) => {

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


    // try catch for transaction errors and unknown error msg handling
    let query
    try {
         query = await transaction.select('email').from('admins').where('email','=' ,bodyData.email).first()
    } catch (error) {
        throw new CreateError('TransactionError' , error.message)
    }




    if (query?.email != bodyData.email) {
        res.send({
            status:0,
            message : "Email is not Registered"
        })
    }
    else{
        let hashPassword = await bcrypt.hash(bodyData.password , 10)
        let registered_at = new Date().toISOString()
        registered_at = registered_at.substring(0 ,registered_at.length - 6)

        console.log(registered_at)
        try {
             await transaction('admins').where('email', bodyData.email).update({
                password : hashPassword ,
                registered_at
             })
       } catch (error) {
           throw new CreateError('TransactionError' , error.message)
       }

       res.send({
        status:1,
        message : "Registration Completed"
    })

    }



}




var adminLogout = async (req,res,next,transaction) => {

    try {
        await transaction('admins').where('id','=',req.admin_id).update({
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
adminRegister = tryCatch(adminRegister)
module.exports = { adminLogin , adminLogout ,adminRegister}