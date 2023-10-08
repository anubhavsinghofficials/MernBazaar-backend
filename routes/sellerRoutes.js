

import { Router } from 'express'
import { sellerAuth } from '../middlewares/auth.js'
import { registerSeller,logInSeller,logOutSeller,logOutFromAllDevices,
         getSellerDetails,updateSellerDetails,updateSellerPassword,
         deleteSellerAccount } from '../controllers/sellerController.js'


const sellerRouter = Router()


// Seller Routes ________________________________________
sellerRouter.route("/seller/register").post(registerSeller)
sellerRouter.route("/seller/login").post(logInSeller)
sellerRouter.route("/seller/logout").get(sellerAuth,logOutSeller)
sellerRouter.route("/seller/logoutall").get(sellerAuth,logOutFromAllDevices)
sellerRouter.route("/seller").get(sellerAuth,getSellerDetails)
                           .patch(sellerAuth,updateSellerDetails)
                           .delete(sellerAuth,deleteSellerAccount)
sellerRouter.route("/seller/password").post(sellerAuth,updateSellerPassword)


export default sellerRouter
