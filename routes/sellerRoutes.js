

import {Router} from 'express'
import { sellerAuth } from '../middlewares/auth.js'
import {registerSeller,logInSeller,
        logOutSeller,logOutFromAllDevices} from '../controllers/sellerController.js'

const userRouter = Router()


userRouter.route("/seller/register").post(registerSeller)

userRouter.route("/seller/login").post(logInSeller)

userRouter.route("/seller/logout").get(sellerAuth,logOutSeller)

userRouter.route("/seller/logoutall").get(sellerAuth,logOutFromAllDevices)


export default userRouter
