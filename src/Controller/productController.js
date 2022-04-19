
const productModel = require("../models/productModel")
const validator = require("../validator.js")
const aws = require("../aws");



const registerProducts = async (req, res) => {
  try {
    const requestBody = req.body;
    const files = req.files;

    if (!validator.isValid(requestBody)) {
      return res.status(400).send({ status: "FAILURE", msg: "enter a request body" });
    }
    if (!validator.isValid(files)) {
      return res.status(400).send({ status: "FAILURE", msg: "please insert the file-data" });
    }

    if (!validator.validFile(files[0])) {
      return res.status(400).send({ status: "FAILURE", msg: "please insert an image in files" });
    }

    let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = requestBody;

    if (!validator.isValid(title)) {
      return res.status(400).send({ status: "FAILURE", msg: "enter a title" });
    }

    let isTitleAlreadyUsed = await productModel.findOne({ title });

    if (isTitleAlreadyUsed) {
      return res.status(400).send({ Status: false, msg: `${title} Already exists` });
    }

    if (!validator.isValid(description)) {
      return res.status(400).send({ status: "FAILURE", msg: "enter a description" });
    }

    if (!validator.isValid(price)) {
      return res.status(400).send({ status: "FAILURE", msg: "enter a price" });
    }

    if (!validator.isValid(currencyId)) {
      return res.status(400).send({ status: "FAILURE", msg: "enter a currencyId" });
    }

    if (!validator.isValid(currencyFormat)) {
      return res.status(400).send({ status: "FAILURE", msg: "enter a currencyFormat" });
    }

    if (!validator.isValid(isFreeShipping)) {
      return res.status(400).send({ status: "FAILURE", msg: "enter a isFreeShipping" });
    }

    if (!validator.isValid(style)) {
      return res.status(400).send({ status: "FAILURE", msg: "enter style" });
    }
    if (installments.length == 0) {
      installments = 0;
    }

    if (!validator.isValid(availableSizes)) {
      return res.status(400).send({ status: "FAILURE", msg: "enter a availableSizes" });
    }

    if (!validator.isValidSize(availableSizes)) {
      return res.status(400).send({ status: false, msg: `select size in this format S, XS, M, X, L, XXL, XL`, });
    }

    let productImage = await aws.uploadFile(files[0]);

    if (!productImage) {
      return res.status(400).send({ status: false, msg: "error in uloading the files" });

    }

    const newProduct = {
      title, description, price, currencyId, currencyFormat, isFreeShipping, productImage,
      style, availableSizes, installments,
    };

    const createProduct = await productModel.create(newProduct);

    res.status(201).send({ status: "SUCCESS", data: createProduct });
  } catch (error) {
    res.status(500).send({ status: "FAILURE", msg: error.message });
  }
};

//-------------------------------------------------------------------------------------------------


const getproducts = async function (req, res) {
  try {
      let { size, name, priceGreaterThan, priceLessThan, priceSort } = req.query
      let filters = { isDeleted: false }

      if (size != null) {
          if (!validator.isValidSize(size)) {
              return res.status(400).send({ status: false, msg: 'No Such Size Exist in our Filters ... Select from ["S", "XS", "M", "X", "L", "XXL", "XL"]' })
          }
          filters["availableSizes"] = size
      }

      let arr = []
      if (name != null) {
          const findTitle = await productModel.find({ isDeleted: false }).select({ title: 1, _id: 0 })
          for (let i = 0; i < findTitle.length; i++) {
              var checkTitle = findTitle[i].title

              let check = checkTitle.includes(name)
              if (check) {
                  arr.push(findTitle[i].title)
              }
          }
          filters["title"] = arr
      }



      if (priceGreaterThan != null && priceLessThan == null) {
          filters["price"] = { $gt: priceGreaterThan }
      }

      if (priceGreaterThan == null && priceLessThan != null) {
          filters["price"] = { $lt: priceLessThan }
      }

      if (priceGreaterThan != null && priceLessThan != null) {
          filters["price"] = { $gte: priceGreaterThan, $lte: priceLessThan }
      }



      if (priceSort != null) {
          if (priceSort == 1) {
              const products = await productModel.find(filters).sort({ price: 1 })
              if (products.length == 0) {
                  return res.status(404).send({ status: false, message: "No data found that matches your search" })
              }
              return res.status(200).send({ status: true, message: "Results", count: products.length, data: products })
          }

          if (priceSort == -1) {
              const products = await productModel.find(filters).sort({ price: -1 })
              if (products.length == 0) {
                  return res.status(404).send({ status: false, message: "No data found that matches your search" })
              }
              return res.status(200).send({ status: true, message: "Results", count: products.length, data: products })
          }
      }

      const products = await productModel.find(filters)
      if (products.length == 0) {
          return res.status(404).send({ status: false, message: "No data found that matches your search" })
      }
      return res.status(200).send({ status: true, message: "Results", count: products.length, data: products })

  }
  catch (error) {
      console.log(error)
      return res.status(500).send({ status: false, message: error.message })
  }
}


//--------------------------------------------------------------------------------------------------------------


const getProduct = async function (req, res) {
  try {
    let productId = req.params.productId

    if (!validator.isValid(productId.trim())) {
      return res.status(400).send({ status: false, msg: "productId required" })

    }

    if (!validator.isValidObjectId(productId)) {
      return res.status(400).send({ status: false, msg: "productId invalid" })
    }

    let productList = await productModel.findOne({ _id: productId })
    if (!productList) {
      return res.status(404).send({ status: false, msg: "not found " })
    }

    return res.status(200).send({ status: true, msg: "user profile details", data: productList })
  }
  catch (err) {
    return res.status(500).send({ status: false, msg: err.message })
  }
}

const Updatedetails = async (req, res) => {

  try {
    let updateData = req.params.productId
    let updatingdata = req.body
    let filedata = req.files

    let productImg = await aws.uploadFile(filedata[0]);

    if (!productImg) {
      return res.status(400).send({ status: false, msg: "error in uloading the files" });
    }

    const { title, description, price, productImage, currencyId, currencyFormat, style, availableSizes, installments } = updatingdata



    const product = await productModel.findOne({ _id: updateData, isDeleted: false })

    if (!(product)) {
      res.status(404).send({ status: false, message: "No data found" })
      return
    }

    let updateone = { title, description, price, productImage, currencyId, currencyFormat, style, availableSizes, installments }

    let isTitleAlreadyUsed = await productModel.findOne({ title })
    if (isTitleAlreadyUsed) {
      return res.status(400).send({ Status: false, msg: `${title} Already exists` });
    }

    let updaterProduct = await productModel.findOneAndUpdate({ _id: updateData }, { ...updateone }, { new: true })
    if (!updaterProduct) {

    }
    return res.status(200).send({ status: true, message: "User profile details", data: updaterProduct })
  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}



const deleteProduct = async function (req, res) {
  try {
    let productId = req.params.productId;
    if (!productId)
      return res.status(400).send({ status: false, msg: "productId is not valid" })

    if (!validator.isValidObjectId(productId.trim())) {
      return res.status(400).send({ status: false, msg: "invalid bookId" })
    }

    let productInfo = await productModel.findOne({ _id:productId });
    if (!productInfo)
      return res.status(404).send({ status: false, msg: "No such product exists" });

    if (productInfo.isDeleted == true) {
      return res.status(404).send({ status: false, msg: "This productId already deleted" });

    }

    let deleteProduct = await productModel.findOneAndUpdate({ _id: productId }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true });
    res.status(200).send({ status: true, msg:"Data Deleted Sucessfully" });


  }

  catch (error) {
    console.log(error.message)
    res.status(500).send({ status: true, msg: error.message })
  }
};





module.exports = { registerProducts, getproducts, getProduct, Updatedetails, deleteProduct }