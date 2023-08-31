

import {Router} from 'express'
import { adminAuth, userAuth } from '../middlewares/auth.js'
import { newOrder, getAllUserOrders, getSingleOrder,
        getSingleOrderAdmin, getAllOrders, updateOrderStatus,
        deleteOrder} from '../controllers/orderController.js'

const orderRouter = Router()



// USER ROUTES ____________________________________________
orderRouter.route('/order/new').post(userAuth,newOrder)
orderRouter.route('/order/:id').get(userAuth,getSingleOrder)
orderRouter.route('/orders').get(userAuth,getAllUserOrders)

// ADMIN ROUTES ___________________________________________
orderRouter.route('/admin/order/:id').get(adminAuth,getSingleOrderAdmin)
                                     .patch(adminAuth,updateOrderStatus)
                                     .delete(adminAuth,deleteOrder)
orderRouter.route('/admin/orders').get(adminAuth,getAllOrders)


export default orderRouter