const jwt = require("jsonwebtoken")
const authentication = function(req,res,next){
    try{
        let token = req.headers["authorization"]
        if(!token)
        return res.status(401).send({status: false, msg:"Token is not present"})
    
        // let decodedToken = jwt.verify(token,"Group24")
        

        let bearerHeader = token && token.split(' ')[1];
        let decodedToken =  jwt.verify(bearerHeader,"Group24", { ignoreExpiration: true })
        if(!decodedToken)
        return res.status(401).send({status:false,msg:"Token is invalid"})
    next()
    }
    catch(error)
    {
        res.status(500).send({status : false,msg : error.message})
    }
}
const authorization = function(req, res, next) {
    
    try{
        let token = req.headers["authorization"]
        if(!token)
        return res.status(401).send({status: false, msg:"Token not present"})
    
        // let decodedToken = jwt.verify(token,"Group24")

        let bearerHeader = token && token.split(' ')[1];
        let decodedToken =  jwt.verify(bearerHeader,"Group24", { ignoreExpiration: true })

        if(!decodedToken)
        return res.status(401).send({status:false,msg:"Token is invalid"})
    
        let userId = req.params.userId
        console.log(userId)
        if (!userId)
        return res.status(400).send({ status: false, msg: "Please Send User Id" })

        let userLoggedIn = decodedToken.UserId
         


        if(userId !== userLoggedIn ){
           
            
          return res.status(403).send({status : false, msg : "User is not Allowed access the request"})
        } next()
    }
        catch(error)
        {   console.log(error)
           return res.status(500).send({status: false ,msg : error.message})
        }

    
}


    module.exports.authorization=authorization
    module.exports.authentication=authentication