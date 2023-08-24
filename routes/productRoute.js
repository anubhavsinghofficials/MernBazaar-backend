

import {Router} from 'express'
import {getProducts,createProduct,
        updateProduct,deleteProduct,
        getProductDetails} from '../controllers/productContoller.js'



const productRouter = Router()


productRouter.route('/products')
            .get(getProducts)
            

productRouter.route("/product/new")
            .post(createProduct)

productRouter.route('/product/:id')
            .get(getProductDetails)
            .patch(updateProduct)
            .delete(deleteProduct)

// productRouter.routes("/product/")



export default productRouter