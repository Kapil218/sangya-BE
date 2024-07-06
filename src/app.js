import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({origin:process.env.CORS_ORIGIN,credentials:true}))
// this will allow all urls to perform all methods on server like GET , PUT, DELETE, UPDATE etc
// by default cookies are blocked in browser we have to set credentials to true to use cookies.

// app.use(cors({origin:"127.0.0.1:5000",credentials:true,
//     methods:["GET","POST"]
// }))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// routes import
import userRouter from "./routes/user.routes.js"

// routes declaration
app.use("/api/v1/users",userRouter)

export {app} 