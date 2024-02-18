const { CreateError }= require('../../utils//trycatchclass')
const Joi = require('joi')
const { tryCatch } = require('../../utils/trycatchhandler')
const nodemailer = require("nodemailer");
require('dotenv').config()


const jwt = require('jsonwebtoken')
const util = require('util')
const bcrypt = require('bcrypt');
const { query } = require('express');
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


var sendOTP = async (req,res,next,transaction) => {
        // data validation
        const validationSchema = Joi.object({
            email: Joi.string().max(50).required(),
        })
        const {error} = await validationSchema.validateAsync(req.body)
        if (error) {
            throw new CreateError('ValidationError' , error.details[0].message)
        }

        const user_mail = req.body?.email

        function generateOTP() {
            const otpLength = 6;
            const otp = Math.floor(100000 + Math.random() * 900000);
            return otp.toString().slice(0, otpLength);
          }
        
          const generatedOTP = generateOTP();

          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: "bohocastle@gmail.com",
              pass: process.env.mail_pass, 
            },
          });
        
          const mailOptions = {
            from: "bohocastle@gmail.com",
            to: user_mail,
            subject: "Portfolio Reset Password Otp",
            text: `Dear User,
              
              You have requested to generate a One-Time Password (OTP) for your Question App account. Please find your OTP below:
              
              Your OTP: ${generatedOTP}
              
              This OTP is valid for a short period and is intended for account verification purposes only. Do not share it with anyone.
              
              If you did not make this request, please ignore this email.
              
              Thank you,
              The Question App Team`,
          };
        
          // Sending the email
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error)
                throw new CreateError("OtpError" , "Error in sending otp from server")
            }

          });

    const present_time = new Date().valueOf()
    try {
        await transaction('admins').where('email','=',user_mail).update({
            otp_time : present_time,
            forgot_otp : generatedOTP
        })
    } catch (error) {
        throw new CreateError('TransactionError' , error.message)
    }


        res.send({
            status:1 ,
            message: `Email sent to ${user_mail}`
        })
 
}



var verifyOTP = async (req,res,next,transaction) => {
        // data validation
        const validationSchema = Joi.object({
            email: Joi.string().max(50).required(),
            otp : Joi.string().max(6).required(),
        })
        const {error} = await validationSchema.validateAsync(req.body)
        if (error) {
            throw new CreateError('ValidationError' , error.details[0].message)
        }
    


    let otp_time;
    let otp;
    try {
       const query =  await transaction('admins').select('forgot_otp','otp_time').where('email','=',req.body.email).first()

       otp = query?.forgot_otp
       otp_time = query?.otp_time
    } catch (error) {
        throw new CreateError('TransactionError' , error.message)
    }


    const present_time = new Date().valueOf()
    const expiry_time = 2 * 60 * 1000

    if (present_time - otp_time >= expiry_time) {
       return res.send({
            status:0 ,
            message: `OTP Expired !`
        })
    } else {
        
        if (req.body.otp == otp) {
            
            return res.send({
                status:1 ,
                message: `OTP verified Successfully`
            })


        }else{

            return res.send({
                status:0 ,
                message: `OTP does not match`
            })


        }
    }
}



var resetPassword = async (req,res,next,transaction) => {
        // data validation
        const validationSchema = Joi.object({
            email: Joi.string().max(50).required(),
            password : Joi.string().max(50).required(),
        })
        const {error} = await validationSchema.validateAsync(req.body)
        if (error) {
            throw new CreateError('ValidationError' , error.details[0].message)
        }

        const {email , password} = req.body
        const new_password = await bcrypt.hash(password ,10 )

    try {
        await transaction('admins').where('email','=',email).update({
            password : new_password
        })

    } catch (error) {
        throw new CreateError('TransactionError' , error.message)
    }

            return res.send({
                status:1 ,
                message: `Password Updated Successfully `
            })

}





adminLogin = tryCatch(adminLogin)
adminLogout = tryCatch(adminLogout)
adminRegister = tryCatch(adminRegister)
sendOTP = tryCatch(sendOTP)
verifyOTP = tryCatch(verifyOTP)
resetPassword = tryCatch(resetPassword)

module.exports = { adminLogin , adminLogout ,adminRegister , sendOTP , verifyOTP , resetPassword}