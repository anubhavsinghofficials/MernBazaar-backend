
import {config} from 'dotenv'
config({path:"./config/.env"})
import express from 'express'
import connectToDatabase from './config/DB_connect.js'
import cookieParser from 'cookie-parser'

import productRouter from './routes/productRoutes.js'
import userRouter from './routes/userRoutes.js'
import sellerRouter from './routes/sellerRoutes.js'
import adminRouter from './routes/adminRoutes.js'
import orderRouter from './routes/orderRoutes.js'

const PORT = process.env.PORT
const app = express()



connectToDatabase()
app.use(cookieParser())
app.use(express.json())
app.use("/api/v1",productRouter)
app.use("/api/v1",userRouter)
app.use("/api/v1",sellerRouter)
app.use("/api/v1",adminRouter)
app.use("/api/v1",orderRouter)



const server = app.listen(PORT, ()=>{
    console.log(`> listening at http://localhost:${PORT}`)
})


export default server