

import {Router} from 'express'
import {getProducts,createProduct,
        updateProduct,deleteProduct,
        getProductDetails,} from '../controllers/productContoller.js'
import { auth,adminAuth } from '../middlewares/auth.js'



const productRouter = Router()


productRouter.route('/products')
            .get(auth,getProducts)

productRouter.route("/product/new")
            .post(auth,adminAuth,createProduct)

productRouter.route('/product/:id')
            .get(getProductDetails)
            .patch(auth,adminAuth,updateProduct)
            .delete(auth,adminAuth,deleteProduct)

// productRouter.routes("/product/")



export default productRouter