const express=require('express')
const app=express()
require('dotenv').config()
const database=require("./config/database")
const userRoutes=require('./routes/user')

const PORT=process.env.PORT||8001

database.connect()

app.use(express.json())

app.use('/api/v1/auth',userRoutes)

app.get("/",(req,res)=>{
    return res.json({
        success:true,
        message:"Your server is up and running"
    })
})

app.listen(PORT,()=>{
    console.log(`App is running at http://localhost:${PORT}`)
})