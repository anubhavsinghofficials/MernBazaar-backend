
import {config} from 'dotenv'
config({path:"./config/.env"})
import express from 'express'
import connectToDatabase from './config/DB_connect.js'
import cookieParser from 'cookie-parser'

import productRouter from './routes/productRoutes.js'
import userRouter from './routes/userRoutes.js'
import sellerRouter from './routes/sellerRoutes.js'
import orderRouter from './routes/orderRoutes.js'
import roleRouter from './routes/roleRoutes.js'
import cors from 'cors'

const PORT = process.env.PORT
const ClientOrigin = process.env.CLIENT
const app = express()



connectToDatabase()

app.use(cors({origin:ClientOrigin, credentials: true,}))
app.use(cookieParser())
app.use(express.json())
app.use("/api/v1",productRouter)
app.use("/api/v1",userRouter)
app.use("/api/v1",sellerRouter)
app.use("/api/v1",orderRouter)
app.use("/api/v1",roleRouter)


const server = app.listen(PORT, ()=>{
    console.log(`> listening at http://localhost:${PORT}`)
})


export default server