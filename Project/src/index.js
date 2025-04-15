import connectDB from "./db/DBconnection.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({
    path:"./.env"
})


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("mongo db connection faild !!!",err)
})




// import express from "express"
// const app = express()

// (async()=>{
//   try {
//     await mongoose.connect(`${process.env.MONGO_URL}/${DB_Name}`)
//     app.on("error",(error)=>{
//         console.log("ERROR",error)
//         throw error
//     })

//     app.listen(process.env.PORT,()=>{
//         console.log(`App is listining on port ${process.env.PORT}`);
//     })
//   } catch (error) {
//     console.log("Error",error);
//   }
// })()