

import {Router} from 'express'
import { adminAuth, userAuth } from '../middlewares/auth.js'
import {registerUser,logInUser,logOutUser,logOutFromAllDevices,
        deleteUserAccount,getUserDetails,updateUserDetails,
        updateUserPassword,getActiveUsers,getBlackListedUsers,
        deleteUser,toggleBlackListedUser,getUserData} from '../controllers/userController.js'
        

const userRouter = Router()


// User Routes __________________________________________
userRouter.route("/user/register").post(registerUser)
userRouter.route("/user/login").post(logInUser)
userRouter.route("/user/logout").get(userAuth,logOutUser)
userRouter.route("/user/logoutall").get(userAuth,logOutFromAllDevices)
userRouter.route("/user").get(userAuth,getUserDetails)
                         .patch(userAuth,updateUserDetails)
                         .delete(userAuth,deleteUserAccount)
userRouter.route("/user/password").post(userAuth,updateUserPassword)


// Admin Routes _________________________________________
userRouter.route("/admin/users").get(adminAuth,getActiveUsers)
userRouter.route("/admin/users/blacklisted").get(adminAuth,getBlackListedUsers)
userRouter.route("/admin/user/:id").get(adminAuth,getUserData)
                                   .patch(adminAuth,toggleBlackListedUser)
                                   .delete(adminAuth,deleteUser)





export default userRouter
