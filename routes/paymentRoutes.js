import { Router } from 'express'
import { processPayment } from '../controllers/paymentController.js'
import { userAuth } from '../middlewares/auth.js'

const paymentRouter = Router()

paymentRouter.route('/payment/process').post(userAuth,processPayment)








export default paymentRouter