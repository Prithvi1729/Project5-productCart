const express=require('express')
const router=express.Router()

const UserController=require("../Controller/uesrController")
const {authentication, authorization} =require("../Middleware/middleware")



router.post("/register",UserController.registerUser)

router.post("/login",UserController.loginUser)

router.get("/user/:userId/profile",authentication,authorization,UserController.getProfile)

router.put("/user/:userId/profile",authentication,authorization, UserController.updateProfile)






module.exports=router