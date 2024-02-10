const express = require("express")

const app = express()

require('dotenv').config()

app.get("/", (req,res)=>{
    res.send("Server is Fine")
})


app.listen(process.env.PORT , ()=>{
    console.log(`Server Started on port ${process.env.PORT}`)
})