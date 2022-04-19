const validator = require('../validator')
const productModel = require('../models/productModel')
const userModel = require('../models/Usermodel')
const cartModel = require('../models/cartModel')




//-----------------------------------------------------------1st api---------------------------------------------------------
const createCart = async function(req, res) {
    let userId = req.params.userId;
    let data = req.body
    let items2 
    if(!(validator.isValid(userId))&&(validator.isValidObjectId(userId))){
        return res.status(400).send({status:false, message:"Please provide a valid userId"})
    }
    if (!validator.isValid(data)) {
      return res.status(400).send({status: false, message: "Plaese Provide all required field" })
  }
     let items = data.items
     if (typeof(items) == "string"){
        items = JSON.parse(items)
    }
     const isCartExist = await cartModel.findOne({userId:userId})
     let totalPrice = 0;
     if(!isCartExist){
        for(let i = 0; i < items.length; i++){
          let productId = items[i].productId
          let quantity = items[i].quantity
           let findProduct = await productModel.findById(productId);
           if(!findProduct){
            return res.status(400).send({status:false, message:"product is not valid"})
           }
           totalPrice = totalPrice + (findProduct.price*quantity)
         }
        let createCart = await cartModel.create({userId:userId,items:items,totalPrice:totalPrice,totalItems:items.length })
         items2 = createCart.items
        return res.status(200).send({status:true,data:createCart})
     } if(isCartExist){
          items2 = isCartExist.items
     }
        let findProduct = await productModel.findById(items[0].productId)
        if(!findProduct){
          return res.status(400).send({status:false, message:"product is not valid"})
         }
       // res.send(findProduct)
        let totalPrice2 = findProduct.price
        let newquantity = items[0].quantity
        let flage = 0
        
           for(let i = 0; i < items2.length; i++){
               let productId = items2[i].productId
            if(productId == items[0].productId){
                   flage = 1
                   items2[i].quantity = items2[i].quantity + newquantity}
               
   }    totalPrice2 = Math.abs(totalPrice2 * newquantity + isCartExist.totalPrice)
        if(flage == 0){
            items2.push(items[0])
        }
       let updateCart = await cartModel.findOneAndUpdate({userId:userId},{$set:{items:items2,totalPrice:totalPrice2,totalItems:items2.length}},{new:true})
               return res.send(updateCart)
   }


//---------------------------------------------------------------2nd api----------------------------------------------------------------




//Updates a cart by either decrementing the quantity of a product by 1 or deleting a product from the cart.
// - Get cart id in request body.
// - Get productId in request body.
// - Get key 'removeProduct' in request body. 
// - Make sure that cart exist.
// - Key 'removeProduct' denotes whether a product is to be removed({removeProduct: 0}) or its quantity has to be decremented by 1({removeProduct: 1}).
// - Make sure the userId in params and in JWT token match.
// - Make sure the user exist
// - Get product(s) details in response body.
// - Check if the productId exists and is not deleted before updating the cart.







const updatedCart = async function (req, res) {
  try {
    let userId = req.params.userId
    const idFromToken = req.userId
    if (!validator.isValidObjectId(userId)) {
      return res.status(400).send({ status: false, msg: "userId is not a valid objectId" })
    }

    //-----authorization--------------
    // if (userId!= idFromToken) {
    //   return res.status(403).send({ status: false, message: "User not authorized" })
    // }

    let data = req.body
    const { cartId, productId, removeProduct } = data

    if (!validator.isValidRequestBody(data)) {
      return res.status(400).send({ status: false, msg: "Enter value to be updating.." })
    }
    if (!validator.isValid(cartId)) {
      return res.status(400).send({ status: false, msg: "cartId is required" })
    }
    if (!validator.isValidObjectId(cartId)) {
      return res.status(400).send({ status: false, msg: "cartId is not a valid objectId" })
    }
    if (!validator.isValid(productId)) {
      return res.status(400).send({ status: false, msg: "productId is required" })
    }
    if (!validator.isValidObjectId(productId)) {
      return res.status(400).send({ status: false, msg: "productId is not a valid objectId" })
    }
    if (!(removeProduct == 0 || removeProduct == 1)) {
      return res.status(400).send({ status: false, msg: "removeProduct value should be either 0 or 1" })
    }

    const userDetails = await userModel.findOne({ _id: userId })
    if (!userDetails) {
      return res.status(404).send({ status: false, msg: "user not exist with this userId" })
    }
    const productDetails = await productModel.findOne({ _id: productId, isDeleted: false })
    if (!productDetails) {
      return res.status(404).send({ status: false, msg: "product not exist or deleted" })
    }
    const cartDetails = await cartModel.findOne({ _id: cartId })
    if (!cartDetails) {
      return res.status(400).send({ status: false, msg: "cart is not added for this cardId, create cart first" })
    }

    if (removeProduct == 1) {
      for (let i = 0; i < cartDetails.items.length; i++) {
        if (cartDetails.items[i].productId == productId) {
          let newPrice = cartDetails.totalPrice - productDetails.price
          if (cartDetails.items[i].quantity > 1) {
            cartDetails.items[i].quantity -= 1
            let updateCartDetails = await cartModel.findOneAndUpdate({ _id: cartId }, { items: cartDetails.items, totalPrice: newPrice }, { new: true })
            return res.status(200).send({ status: true, msg: "cart updated successfully", data: updateCartDetails })
          }
          else {
            totalItem = cartDetails.totalItems - 1
            cartDetails.items.splice(i, 1)

            let updatedDetails = await cartModel.findOneAndUpdate({ _id: cartId }, { items: cartDetails.items, totalPrice: newPrice, totalItems: totalItem }, { new: true })
            return res.status(200).send({ status: true, msg: "cart removed successfully", data: updatedDetails })
          }
        }
      }
    }

    if (removeProduct == 0) {
      for (let i = 0; i < cartDetails.items.length; i++) {
        if (cartDetails.items[i].productId == productId) {
          let newPrice = cartDetails.totalPrice - (productDetails.price * cartDetails.items[i].quantity)
          let totalItem = cartDetails.totalItems - 1
          cartDetails.items.splice(i, 1)
          let updatedCartDetails = await cartModel.findOneAndUpdate({ _id: cartId }, { items: cartDetails.items, totalItems: totalItem, totalPrice: newPrice }, { new: true })
          return res.status(200).send({ status: true, msg: "item removed successfully", data: updatedCartDetails })
        }
      }
    }

  }
  catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}

//------------------------------------------------------------------3rd api--------------------------------------------------------------------------------



const getcartById = async function (req, res) {
  try {
    const userId = req.params.userId

    // if (req.userId !== userId) {
    //   return res.status(401).send({ status: false, msg: "you are not authorized" })
    // }
    if (!validator.isValidObjectId(userId)) {
      return res.status(400).send({ status: false, msg: "invalid userid" })
    }

    const userexist = await userModel.findById({ _id: userId })
    if (!userexist) {
      return res.status(404).send({ status: false, msg: "user doesnot exist" })
    }

    const cart = await cartModel.findOne({ userId: userId })
    if (!userexist) {
      return res.status(400).send({ status: false, msg: "no cart exist" })
    }
    return res.status(200).send({ status: true, msg: "successfully found", data: cart })


  } catch (error) {
    return res.status(400).send({ status: false, msg: error.message })

  }
}




//-------------------------------------------------------------------4th api------------------------------------------------------------------

const emptyCart = async function (req, res) {
  try {
    const userId = req.params.userId
    // const queryParams = req.query;
    
    // if (!validator.isValidRequestBody(queryParams)) {
    //   return res
    //     .status(404)
    //     .send({ status: false, message: " page not found" });
    // }
    if (!validator.isValid(userId)) {
      return res.status(400).send({ status: false, msg: "Please Enter userId" })
    }
    if (!validator.isValidObjectId(userId)) {
      return res.status(400).send({ status: false, msg: "invalid userid" })
    }
    const cartByUserId = await cartModel.findOne({ userId: userId });

    if (!cartByUserId) {
      return res.status(404).send({
        status: false,
        message: `no cart found by ${userId}`,
      });
    }

    const makeCartEmpty = await cartModel.findOneAndUpdate(
      { userId: userId },
      { $set: { items: [], totalPrice: 0, totalItems: 0 } },
      { new: true }
    )
    return res.status(200).send({ status: true, message: "cart made empty successfully", data: makeCartEmpty })

  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}



module.exports = {
    createCart,
  updatedCart,
  emptyCart,
  getcartById
}