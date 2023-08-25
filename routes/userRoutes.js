

import {Router} from 'express'
import {registerUser,logInUser,
        logOutUser, logOutFromAllDevices} from '../controllers/userController.js'
import { auth } from '../middlewares/auth.js'

const userRouter = Router()


userRouter.route("/user/register").post(registerUser)

userRouter.route("/user/login").post(logInUser)

userRouter.route("/user/logout").get(auth,logOutUser)

userRouter.route("/user/logoutall").get(auth,logOutFromAllDevices)


export default userRouter
