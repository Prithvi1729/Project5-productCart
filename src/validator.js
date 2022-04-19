const mongoose = require("mongoose");

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const phoneRegex = /^[6-9]\d{9}$/;

const imageRegex = /.*\.(jpeg|jpg|png)$/;

const pincodeRegex = /^[1-9][0-9]{5}$/;

const validPassword = /^[a-zA-Z0-9!@#$%^&*]{8,15}$/;

const availableSizes = ["S", "XS", "M", "X", "L", "XXL", "XL"]


const validEmail = function (email) {
  return emailRegex.test(email);
};

const validPhone = function (phone) {
  return phoneRegex.test(phone);
};
const isvalidPassword=function(password){
    return validPassword.test(password)
}


const validPincode = function (pincode) {
  return pincodeRegex.test(pincode);
};

const isValid = function (value) {
  if (typeof value === "object" && value.length === 0) return false;
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  if (typeof value === "number" && value.toString().trim().length === 0)
    return false;
  if (typeof value == "Boolean") return true;
  return true;
};

const isValidObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId);
};

const isValidRequestBody = function (requestBody) {
  return Object.keys(requestBody).length > 0;
};

const validFile = function (files) {

  return imageRegex.test(files.originalname);
};

const isValidSize = function (size) {
  return  availableSizes.indexOf(size) != -1;
};

// const isValidStatus = function (status) {
//  return  availableSizes.enum.indexOf(status) != -1; 
// };

module.exports = {
  validEmail,
  validPhone,
  isvalidPassword,
  validPincode,
  isValid,
  isValidRequestBody,
  isValidObjectId,
  validFile,
  isValidSize
};
