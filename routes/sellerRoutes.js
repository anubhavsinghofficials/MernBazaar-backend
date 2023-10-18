

import { Router } from 'express'
import { sellerAuth } from '../middlewares/auth.js'
import { registerSeller,logInSeller,logOutSeller,logOutFromAllDevices,
         getSellerDetails,updateSellerDetails,updateSellerPassword,
        } from '../controllers/sellerController.js'


const sellerRouter = Router()


// Seller Routes ________________________________________
sellerRouter.route("/seller/register").post(registerSeller)
sellerRouter.route("/seller/login").post(logInSeller)
sellerRouter.route("/seller/logout").post(sellerAuth,logOutSeller)
sellerRouter.route("/seller/logoutall").post(sellerAuth,logOutFromAllDevices)
sellerRouter.route("/seller").get(sellerAuth,getSellerDetails)
                             .patch(sellerAuth,updateSellerDetails)
sellerRouter.route("/seller/password").post(sellerAuth,updateSellerPassword)


export default sellerRouter
