import express from "express";

const app= express();

// app.get("/",(req,res)=>{
//     res.send("server is ready")
// })

app.get("/api/jokes",(req,res)=>{
    const joks=[
        {
            id:1,
            title:"A 1 joke",
            content:"this is a joke"
        },
        {
            id:2,
            title:"A 2 joke",
            content:"this is a second joke"
        },
        {
            id:3,
            title:"A 3 joke",
            content:"this is a third joke"
        },
        {
            id:4,
            title:"A 4 joke",
            content:"this is a fourth joke"
        }
    ]
    res.send(joks)
})

const PORT=process.env.PORT || 2000;

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})