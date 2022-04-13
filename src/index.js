const express=require('express')
const bodyParser=require('body-parser')
const route=require('./routes/route')
const mongoose=require('mongoose')
const app=express()
const multer = require("multer")

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(multer().any())

mongoose.connect("mongodb+srv://Prasoon:nKTyhNdAfRpxMY7N@cluster0.vjjsq.mongodb.net/Prasoon001?retryWrites=true&w=majority",{useNewUrlParser:true ,  useUnifiedTopology: true})
 .then(() => console.log("MongoDb is connected"))
 .catch(err => console.log(err))
   
 app.use('/',route)

 app.listen(process.env.PORT || 3000,function()
 {
     console.log("Express app running on PORT"+(process.env.PORT || 3000))
 })