const CreateError = require('../../utils//trycatchclass')
const Joi = require('joi')
const { tryCatch } = require('../../utils/trycatchhandler')
require('dotenv').config()


const jwt = require('jsonwebtoken')
const util = require('util')
const bcrypt = require('bcrypt')
const AsignSync = util.promisify(jwt.sign())



const adminLogin = async (req,res,next,transaction) => {

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
        const {email , password} = await transaction.select('email','password').from('admins').where('email','=' ,bodyData.email).first()

        tableEmail = email
        hashPassword = password
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
        const {id} = await transaction().select('id').from('admins').where('email','=',bodyData.email).first()
        const payload = {
            id,
            key : process.env.SECRET_KEY
        }

        const token = await AsignSync(payload,{
            expiresIn : '100d'
        })


        res.send({
            status:1,
            token ,
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

adminLogin = tryCatch(adminLogin)
module.exports = { adminLogin }