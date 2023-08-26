

import {Router} from 'express'
import { userAuth } from '../middlewares/auth.js'
import {registerUser,logInUser,
        logOutUser, logOutFromAllDevices} from '../controllers/userController.js'

const userRouter = Router()


userRouter.route("/user/register").post(registerUser)

userRouter.route("/user/login").post(logInUser)

userRouter.route("/user/logout").get(userAuth,logOutUser)

userRouter.route("/user/logoutall").get(userAuth,logOutFromAllDevices)


export default userRouter
