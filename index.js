const express = require("express")
const db = require('./db')
const cors = require('cors')

const app = express()
const rateLimit = require('express-rate-limit')
const path = require('path')
const ejs = require('ejs')

require('dotenv').config()

// routes import

// admin
const adminLoginRoute = require('./admin/router/loginRoutes')
const adminProfileRoute = require('./admin/router/profileRoutes')


// middlewares
const corsOptions = {
    origin: '*', 
    methods: 'GET,POST, PUT,DELETE',           
    optionsSuccessStatus: 200     
};

app.use(cors(corsOptions));
app.use(rateLimit({
    windowMs : 15 * 60 * 1000,
    max : 1000
}))
app.use(express.json({
    limit:'5mb'
}))
app.use(express.json())
app.use('/', express.static(path.join(__dirname , 'public')))   // for serving static files to the /filename api requests
app.set('view engine' , 'ejs')
app.set('views' ,  path.join(__dirname , 'public' , 'views'))


// routes
app.use('/admin/registration' , adminLoginRoute)
app.use('/admin/profile' , adminProfileRoute)







app.get("/", (req,res) =>{
    res.send("Server is Fine")
})
app.get("*", async(req,res)=>{
    res.send({
        status : "6320" ,
        Backend_Error : "There in no route like this , hit the correct route"
    })
})
app.listen(process.env.PORT , ()=>{
    console.log(`Server Started on port ${process.env.PORT}`)
})