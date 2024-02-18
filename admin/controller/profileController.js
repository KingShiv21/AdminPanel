const { CreateError }= require('../../utils//trycatchclass')
const Joi = require('joi')
const { tryCatch } = require('../../utils/trycatchhandler')



var uploadProfile = async(req,res,next,transaction) => {

    if (req?.file) {

        var baseUrl = `${req.protocol}://${req.get('host')}`;
        baseUrl+="/profile/"+req.file.filename


        try {
            await transaction('admins').where('id','=',req.admin_id).update({
                profile : baseUrl
            })
        } catch (error) {
            throw new CreateError('TransactionError' , error.message)
        }

    } else {
        throw new CreateError("FileUploadError" ,"Image is empty !")
    }

    return res.send({
        status:1,
        message:"Profile Updated Successfully"
    })
}

var saveProfile = async(req,res,next,transaction) =>{
    const validationSchema = Joi.object({
        name : Joi.string().max(50).required()
    })

    const { error } = await validationSchema.validateAsync(req.body)
    if (error) {
        throw new CreateError('ValidationError' , error.details[0].message)
    }


        try {
            await transaction('admins').where('id','=',req.admin_id).update({
               name : req.body.name
            })
        } catch (error) {
            throw new CreateError('TransactionError' , error.message)
        }

    return res.send({
        status:1,
        message:"Profile details Updated"
    })
}


var getProfile = async(req,res,next,transaction) =>{

    let data = {}
        try {
          const query = await transaction('admins').select("*").where('id','=',req.admin_id).first()
          data = {...data , 
            "id":  query?.id , 
            "name": query?.name ,
            "email": query?.email ,
            "profile": query?.profile 
        }

        } catch (error) {
            throw new CreateError('TransactionError' , error.message)
        }

    return res.send({
        status:1,
        data
    })
}

uploadProfile = tryCatch(uploadProfile)
saveProfile = tryCatch(saveProfile)
getProfile = tryCatch(getProfile)
module.exports = {uploadProfile , saveProfile , getProfile}