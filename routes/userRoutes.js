

import { Router } from 'express'
import { sellerAuth, userAuth } from '../middlewares/auth.js'
import { registerUser,logInUser,logOutUser,logOutFromAllDevices,
         getUserDetails,updateUserDetails,updateUserPassword,
         getActiveUsers, getShippingInfo, getCart,addToCart,
         deleteCartProduct, applyCouponCode} from '../controllers/userController.js'
        

const userRouter = Router()


// User Routes __________________________________________
userRouter.route("/user/register").post(registerUser)
userRouter.route("/user/login").post(logInUser)
userRouter.route("/user/logout").post(userAuth,logOutUser)
userRouter.route("/user/logoutall").post(userAuth,logOutFromAllDevices)
userRouter.route("/user").get(userAuth,getUserDetails)
                         .patch(userAuth,updateUserDetails)
userRouter.route("/user/password").patch(userAuth,updateUserPassword)
userRouter.route("/user/shippinginfo").get(userAuth,getShippingInfo)
userRouter.route("/user/coupon").post(userAuth,applyCouponCode)
userRouter.route("/user/cart").get(userAuth,getCart)
                              .patch(userAuth,addToCart)
userRouter.route("/user/cart/:id").delete(userAuth,deleteCartProduct)

// Seller Routes _________________________________________
userRouter.route("/seller/users").get(sellerAuth,getActiveUsers)




export default userRouter
