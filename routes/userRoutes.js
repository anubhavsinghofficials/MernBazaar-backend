

import { Router } from 'express'
import { sellerAuth, userAuth } from '../middlewares/auth.js'
import { registerUser,logInUser,logOutUser,logOutFromAllDevices,
         deleteUserAccount,getUserDetails,updateUserDetails,
         updateUserPassword,getActiveUsers,getUserData } from '../controllers/userController.js'
        

const userRouter = Router()


// User Routes __________________________________________
userRouter.route("/user/register").post(registerUser)
userRouter.route("/user/login").post(logInUser)
userRouter.route("/user/logout").get(userAuth,logOutUser)
userRouter.route("/user/logoutall").get(userAuth,logOutFromAllDevices)
userRouter.route("/user").get(userAuth,getUserDetails)
                         .patch(userAuth,updateUserDetails)
                         .delete(userAuth,deleteUserAccount)
userRouter.route("/user/password").patch(userAuth,updateUserPassword)


// Seller Routes _________________________________________
userRouter.route("/seller/users").get(sellerAuth,getActiveUsers)
userRouter.route("/seller/user/:id").get(sellerAuth,getUserData)




export default userRouter
