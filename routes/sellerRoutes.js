

import { Router } from 'express'
import { sellerAuth } from '../middlewares/auth.js'
import { registerSeller,logInSeller,logOutSeller,logOutFromAllDevices,
         getSellerDetails,updateSellerDetails,updateSellerPassword,
         createNewCoupon, deleteCoupon, getCoupons } from '../controllers/sellerController.js'
import { getHighlights, getInsights, getInventory, getSellerScores } from '../controllers/analyticsController.js'

const sellerRouter = Router()


// Seller Actions Routes________________________________________
sellerRouter.route("/seller/register").post(registerSeller)
sellerRouter.route("/seller/login").post(logInSeller)
sellerRouter.route("/seller/logout").post(sellerAuth,logOutSeller)
sellerRouter.route("/seller/logoutall").post(sellerAuth,logOutFromAllDevices)
sellerRouter.route("/seller").get(sellerAuth,getSellerDetails)
                             .patch(sellerAuth,updateSellerDetails)
sellerRouter.route("/seller/password").patch(sellerAuth,updateSellerPassword)
sellerRouter.route("/seller/coupons").get(sellerAuth,getCoupons)
sellerRouter.route("/seller/coupon/new").post(sellerAuth,createNewCoupon)
sellerRouter.route("/seller/coupon/:id").delete(sellerAuth,deleteCoupon)

// Seller Analytics Routes______________________________________
sellerRouter.route('/seller/analytics/highlights').get(sellerAuth,getHighlights)
sellerRouter.route('/seller/analytics/inventory').get(sellerAuth,getInventory)
sellerRouter.route('/seller/analytics/sellerscore').get(sellerAuth,getSellerScores)
sellerRouter.route('/seller/analytics/insights').get(sellerAuth,getInsights)


export default sellerRouter
