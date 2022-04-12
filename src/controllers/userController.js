const { userModel } = require("../models");

const { validator, aws, jwt } = require("../utils");

const bcrypt = require("bcrypt");

const registerUser = async (req, res) => {
  try {
    const requestBody = req.body;
  // SEND REQUEST BODY SEPARATELY
    const files = req.file;

    // VALID REQUEST BODY

    if (!validator.isValid(requestBody)) {
      res
        .status(400)
        .send({ status: false, message: "Invalid request , Body is required" });
      return;
    }

    if (!validator.isValidRequestBody(JSON.parse(requestBody))) {
      res
        .status(400)
        .send({ status: false, msg: "please enter the user details" });
      return;
    }

    // VALID FILES
    if (!validator.isValid(files)) {
      res
        .status(400)
        .send({ status: false, msg: "please insert the file-data" });
      return;
    }

    if (!validator.validFile(files[0])) {
      res
        .status(400)
        .send({ status: false, msg: "please insert an image in files" });
      return;
    }

    //  OBJECT DESTRUCTURING
    let { fname, lname, email, phone, password} = requestBody;
    let address = JSON.parse(requestBody.address)

    // VALIDATING EACH REQUIREMENT
    // NAME
    if (!validator.isValid(fname)) {
      res
        .status(400)
        .send({ status: false, msg: "please enter the first name" });
      return;
    }

    if (!validator.isValid(lname)) {
      res
        .status(400)
        .send({ status: false, msg: "please enter the last name" });
      return;
    }

    // EMAIL
    if (!validator.isValid(email)) {
      res.status(400).send({ status: false, msg: "please enter an email" });
      return;
    }

    if (!validator.validEmail(email)) {
      res
        .status(400)
        .send({ status: false, msg: "please enter the valid email" });
      return;
    }

    let isEmailAlreadyUsed = await userModel.findOne({ email });

    if (isEmailAlreadyUsed) {
      res
        .status(400)
        .send({ status: false, msg: `this ${email} is already registered` });
      return;
    }

    // PHONE
    if (!validator.isValid(phone)) {
      res
        .status(400)
        .send({ status: false, msg: "please enter the phone no." });
      return;
    }

    if (!validator.validPhone(phone)) {
      res
        .status(400)
        .send({ status: false, msg: "please enter the valid phone no." });
      return;
    }

    let isPhoneAlreadyUsed = await userModel.findOne({ phone });

    if (isPhoneAlreadyUsed) {
      res
        .status(400)
        .send({ status: false, msg: `this ${phone} is already registered` });
      return;
    }

    // PASSWORD
    if (!validator.isValid(password)) {
      res.status(400).send({ status: false, msg: "please enter the password" });
      return;
    }

    if (!validator.validPassword(password)) {
      res
        .status(400)
        .send({ status: false, msg: "please enter the valid password" });
      return;
    }

    // ENCRYPTING PASSWORD
    let saltRounds = 10;
    let salt = await bcrypt.genSalt(saltRounds);
    let hash = await bcrypt.hash(password, salt);

    password = hash;

    // ADDRESS
    if (!validator.isValid(address)) {
      res.status(400).send({ status: false, msg: "please provide a address" });
      return;
    }

    if (!validator.isValid(address.shipping)) {
      res
        .status(400)
        .send({ status: false, msg: "please provide a shipping address" });
      return;
    }

    if (!validator.isValid(address.billing)) {
      res
        .status(400)
        .send({ status: false, msg: "please provide a billing address" });
      return;
    }

    if (!validator.isValid(address.shipping.street)) {
      res
        .status(400)
        .send({ status: false, msg: "please provide a shipping street" });
      return;
    }

    if (!validator.isValid(address.shipping.city)) {
      res
        .status(400)
        .send({ status: false, msg: "please provide a shipping city" });
      return;
    }

    if (!validator.isValid(address.shipping.pincode)) {
      res
        .status(400)
        .send({ status: false, msg: "please provide a shipping pincode" });
      return;
    }
    if (!validator.validPincode(address.shipping.pincode)) {
      res
        .status(400)
        .send({ status: false, msg: "Please provide valid shipping pincode" });
      return;
    }

    if (!validator.isValid(address.billing.street)) {
      res
        .status(400)
        .send({ status: false, msg: "please provide a billing street" });
      return;
    }

    if (!validator.isValid(address.billing.city)) {
      res
        .status(400)
        .send({ status: false, msg: "please provide a billing city" });
      return;
    }

    if (!validator.isValid(address.billing.pincode)) {
      res
        .status(400)
        .send({ status: false, msg: "please provide a billing pincode" });
      return;
    }
    if (!validator.validPincode(address.billing.pincode)) {
      res
        .status(400)
        .send({ status: false, msg: "Please provide valid billing pincode" });
      return;
    }

    // UPLOADING THE FILE
    let profileImage = await aws.uploadFile(files[0]);

    if (!profileImage) {
      res
        .status(400)
        .send({ status: false, msg: "error in uloading the files" });
      return;
    }

    // GETTING ALL THE VALUES
    const newUser = {
      fname,
      lname,
      email,
      profileImage,
      phone,
      password,
      address,
    };

    // CREATING USER
    createdUser = await userModel.create(newUser);

    res.status(201).send({
      status: true,
      msg: "user successfully created",
      data: createdUser,
    });
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};

module.exports = {registerUser};
