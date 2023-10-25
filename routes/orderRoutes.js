

import { Router } from 'express'
import { userAuth, sellerAuth } from '../middlewares/auth.js'
import { newOrder, getAllUserOrders, getSingleOrderSeller,
        getAllOrders, updateOrderStatus} from '../controllers/orderController.js'

const orderRouter = Router()



// USER ROUTES ____________________________________________
orderRouter.route('/order/new').post(userAuth,newOrder)
orderRouter.route('/orders').get(userAuth,getAllUserOrders)

// Seller ROUTES ___________________________________________
orderRouter.route('/seller/order/:id').get(sellerAuth,getSingleOrderSeller)
                                      .patch(sellerAuth,updateOrderStatus)
orderRouter.route('/seller/orders').get(sellerAuth,getAllOrders)


export default orderRouter