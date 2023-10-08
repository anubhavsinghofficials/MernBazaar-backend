

import {Router} from 'express'
import { userAuth, sellerAuth } from '../middlewares/auth.js'
import { newOrder, getAllUserOrders, getSingleOrder,
        getSingleOrderSeller, getAllOrders, updateOrderStatus,
        deleteOrder} from '../controllers/orderController.js'

const orderRouter = Router()



// USER ROUTES ____________________________________________
orderRouter.route('/order/new').post(userAuth,newOrder)
orderRouter.route('/order/:id').get(userAuth,getSingleOrder)
orderRouter.route('/orders').get(userAuth,getAllUserOrders)

// Seller ROUTES ___________________________________________
orderRouter.route('/seller/order/:id').get(sellerAuth,getSingleOrderSeller)
                                     .patch(sellerAuth,updateOrderStatus)
                                     .delete(sellerAuth,deleteOrder)
orderRouter.route('/seller/orders').get(sellerAuth,getAllOrders)


export default orderRouter