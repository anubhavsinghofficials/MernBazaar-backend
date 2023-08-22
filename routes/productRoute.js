

import {Router} from 'express'
import {getAllProducts} from '../controllers/productContoller.js'



const productRouter = Router()



productRouter.route("/").get(getAllProducts)





export default productRouter