const Knex = require('../db')

export const tryCatch = (controller) =>{
    return async (req,res,next) =>{
        
        try {
            var transaction = await Knex.transaction()
            await controller(req,res,next,transaction);
            await transaction.commit()
        } catch (error) {
            await transaction.rollback()

            console.log("error in try catch pool" , error)

            if (err.name === 'ValidationError') {
                return res.send({ status:"VAL_ERR", Backend_Error:err.message });
              }
             else if (err.name === 'TransactionError') {
                return res.send({ status:"TXN_ERR", Backend_Error: err.message });
              }
              else if (err.name === 'FileUploadError') {
                return res.send({ status:"FILE_ERR", Backend_Error: err.message });
              }
      
              else if(err.name === 'CustomError'){
                return res.send({ status:"CUSTOM_ERR", Backend_Error: err.message });
              }
      
              else if(err.name === 'TokenError'){
                return res.send({ status:"TOKEN_ERR", Backend_Error: err.message });
              }
              else{
                return res.send({ status:"INT_ERR",  Backend_Error: err.message });
              }
        }
    }
}