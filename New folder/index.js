const express = require("express")
const app= express()
require ("dotenv").config()


// const PORT=2000;

app.get("/",(req,res)=>{
    res.send("hello world")
})

app.get("/login",(req,res)=>{
    res.send("you are loggined")
})

app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);    
})
