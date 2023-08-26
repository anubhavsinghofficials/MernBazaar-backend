

import {Router} from 'express'
import {getProducts,createProduct,
        updateProduct,deleteProduct,
        getProductDetails,} from '../controllers/productContoller.js'
import { sellerAuth } from '../middlewares/auth.js'



const productRouter = Router()


productRouter.route('/products')
             .get(getProducts)

productRouter.route("/product/new")
             .post(sellerAuth,createProduct)

productRouter.route('/product/:id')
             .get(getProductDetails)
             .patch(sellerAuth,updateProduct)
             .delete(sellerAuth,deleteProduct)

// productRouter.routes("/product/")



export default productRouter