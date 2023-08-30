

import {Router} from 'express'
import {getProducts,createProduct,updateProduct,
        deleteProduct,getProductDetails,reviewProduct,
        getAllReviews,deleteReview} from '../controllers/productContoller.js'
import { sellerAuth, tempUserAuth, userAuth } from '../middlewares/auth.js'


const productRouter = Router()

productRouter.route('/products').get(getProducts)
productRouter.route('/product/new').post(sellerAuth,createProduct)
productRouter.route("/product/reviews/:id").get(tempUserAuth,getAllReviews)
productRouter.route("/product/review/:id").post(userAuth,reviewProduct)
                                          .delete(userAuth,deleteReview)
productRouter.route('/product/:id').get(getProductDetails)
                                   .patch(sellerAuth,updateProduct)
                                   .delete(sellerAuth,deleteProduct)

export default productRouter