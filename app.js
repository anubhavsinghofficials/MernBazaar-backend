
import {config} from 'dotenv'
config({path:"./config/.env"})
import express from 'express'
import connectToDatabase from './config/DB_connect.js'
import cookieParser from 'cookie-parser'
import fileUpload from 'express-fileupload'
import {v2 as cloudinary} from 'cloudinary'


import productRouter from './routes/productRoutes.js'
import userRouter from './routes/userRoutes.js'
import sellerRouter from './routes/sellerRoutes.js'
import orderRouter from './routes/orderRoutes.js'
import roleRouter from './routes/roleRoutes.js'
import paymentRouter from './routes/paymentRoutes.js'
import cors from 'cors'



const app = express()
connectToDatabase()


app.use(cors({origin:process.env.CLIENT, credentials: true,}))
app.use(cookieParser())
app.use(express.json())
app.use(fileUpload())
app.use("/api/v1",productRouter)
app.use("/api/v1",userRouter)
app.use("/api/v1",sellerRouter)
app.use("/api/v1",orderRouter)
app.use("/api/v1",roleRouter)
app.use("/api/v1",paymentRouter)


cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET 
})

const server = app.listen(process.env.PORT, ()=>{
    console.log(`> listening at port ${process.env.PORT}`)
})


export default server