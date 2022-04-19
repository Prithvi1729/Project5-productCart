const userModel=require("../models/Usermodel")
const validator = require("../validator.js")
const jwt = require("jsonwebtoken")
const aws = require("../aws")

const bcrypt = require("bcrypt");



const registerUser = async (req, res) => {
  try {
    const requestBody = req.body;
   
    const files = req.files;
    // let address = JSON.parse(req.body.address)

    if (!validator.isValid(requestBody)) {
      return res.status(400).send({ status: false, message: "Invalid request , Body is required" });
    }

    if (!validator.isValidRequestBody(requestBody)) {
      return res.status(400).send({ status: false, msg: "please enter the user details" });
      
    }
    if (!validator.isValid(files)) {
      return res.status(400).send({ status: false, msg: "please insert the file-data" });
    }

    // if (!validator.validFile(files[0])) {
    //   return res.status(400).send({ status: false, msg: "please insert an image in files" });
    // }
    let { firstname, lastname, email, phone, password, address} = requestBody;
    // let addres = JSON.parse(requestBody.address)

    if (!validator.isValid(firstname)) {
      return res.status(400).send({ status: false, msg: "please enter the first name" });
    }

    if (!validator.isValid(lastname)) {
      return res.status(400).send({ status: false, msg: "please enter the last name" });
    }

    if (!validator.isValid(email)) {
      return res.status(400).send({ status: false, msg: "please enter an email" });
    }

    if (!validator.validEmail(email)) {
      return res.status(400).send({ status: false, msg: "please enter the valid email" });
    }
    let isEmailAlreadyUsed = await userModel.findOne({ email });

    if (isEmailAlreadyUsed) {
      return res.status(400).send({ status: false, msg: `this ${email} is already registered` });
      
    }

    if (!validator.isValid(phone)) {
        return res.status(400).send({ status: false, msg: "please enter the phone no." });
      
    }

    if (!validator.validPhone(phone)) {
        return res.status(400).send({ status: false, msg: "please enter the valid phone no." });
     
    }

    let isPhoneAlreadyUsed = await userModel.findOne({ phone });

    if (isPhoneAlreadyUsed) {
      return res.status(400).send({ status: false, msg: `this ${phone} is already registered` });
    }

    if (!validator.isValid(password)) {
      return res.status(400).send({ status: false, msg: "please enter the password" });
    }

    if (!validator.isvalidPassword(password)) {
      return res.status(400).send({ status: false, msg: "please enter the valid password" });
    }

    let saltRounds = 10;
    let salt = await bcrypt.genSalt(saltRounds);
    let hash = await bcrypt.hash(password, salt);

    password = hash;

  
    if (!validator.isValid(address)) {
      return res.status(400).send({ status: false, msg: "please provide a address" });
    }

    if (!validator.isValid(address.shipping)) {
      return res.status(400).send({ status: false, msg: "please provide a shipping address" });
    }

    if (!validator.isValid(address.billing)) {
      return res.status(400).send({ status: false, msg: "please provide a billing address" });
    }

    if (!validator.isValid(address.shipping.street)) {
      return res.status(400).send({ status: false, msg: "please provide a shipping street" });
    }

    if (!validator.isValid(address.shipping.city)) {
      return res.status(400).send({ status: false, msg: "please provide a shipping city" });
    }

    if (!validator.isValid(address.shipping.pincode)) {
      return  res.status(400).send({ status: false, msg: "please provide a shipping pincode" });
    }
    if (!validator.validPincode(address.shipping.pincode)) {
      return res.status(400).send({ status: false, msg: "Please provide valid shipping pincode" });
    }

    if (!validator.isValid(address.billing.street)) {
      return  res.status(400).send({ status: false, msg: "please provide a billing street" });
    }

    if (!validator.isValid(address.billing.city)) {
      return  res.status(400).send({ status: false, msg: "please provide a billing city" });
    }

    if (!validator.isValid(address.billing.pincode)) {
     return res.status(400).send({ status: false, msg: "please provide a billing pincode" });
    }
    if (!validator.validPincode(address.billing.pincode)) {
      return  res.status(400).send({ status: false, msg: "Please provide valid billing pincode" });
      
    }

    
let profileImage = await aws.uploadFile(files[0]);

    if (!profileImage) {
      return res.status(400).send({ status: false, msg: "error in uloading the files" });
    }

  
    const newUser = {
      firstname,
      lastname,
      email,
      profileImage,
      phone,
      password,
      address,
    };

    createdUser = await userModel.create(newUser);
    
    res.status(201).send({status: true,msg: "user successfully created",data: createdUser});
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};



////.........................................................................
const loginUser = async function(req,res){
    try{
        const data = req.body
        const {email , password} = data
        if(!validator.isValidRequestBody(data)){
            return res.status(400).send({status:false, msg:"please enter some data"})
        }
        if(!validator.isValid(email)){
            return res.status(400).send({status:false , msg:"please enter email id"})
        }
        if (!validator.validEmail(email.trim())) {
          return res.status(400).send({ status: false, message: `Email should be a valid email address` })
            
        }
        if(!validator.isValid(password.trim())){
            return res.status(400).send({status:false , msg: "Please enter password"})
        }
        if (!validator.isvalidPassword(password.trim())) {
            return res.status(400).send({status: false, msg: "password length Min.8 - Max. 15" })
        }

        let validPassword = await bcrypt.compare(password, data.password);


        const CheckingUser = await userModel.findOne({email , validPassword})
        if(!CheckingUser){
            return res.status(400).send({status: false , msg:"This user is not exists"})
        }


        const token = await jwt.sign({
            UserId: CheckingUser._id
        }, 'Group24',{ expiresIn: 60 * 60 },{iat:Date.now()})

        res.header('x-api-key', token);
        return res.status(200).send({ status: true, message: `Author login successfull`,  data: {userId:CheckingUser._id, token:token } });
    } catch (error) {
       return res.status(500).send({ status: false, message: error.message });
    }
}

///...............................................................................................

const getProfile = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!validator.isValid(userId.trim())) {
            return res.status(400).send({ status: false, msg: "userId required" })
        }
        let getList = await userModel.findOne({ _id: userId })
        if (!getList) {
            return res.status(404).send({ status: false, msg: "not found " })
        }
       
        return res.status(200).send({ status:true, msg: "user profile details", data: getList })
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


/////.updateProfile.........................................................................................................

const updateProfile=async function(req,res){

try{
  let updateData=req.params.userId
  let updatingdata = req.body
  let filedata = req.files

  let profileImg = await aws.uploadFile(filedata[0]);

  if (!profileImg) {
    return res.status(400).send({ status: false, msg: "error in uloading the files" });
  }

  const{firstname,lastname,email,profileImage,phone,password,address} = updatingdata
   

  
  let updateone={ firstname,lastname,email,profileImage,phone,password,address}

  let updaterUser= await userModel.findByIdAndUpdate({_id:updateData},{...updateone, profileImage:profileImg},{new:true})
  
   return res.status(200).send({status:true, message:"User profile details",data:updaterUser})
}
catch(err){
return res.status(500).send({status:false,message:err.message})
}
}


module.exports={updateProfile,loginUser,getProfile,registerUser}