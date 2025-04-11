import mongoose, { Types } from "mongoose";

const hospitalSchema = new mongoose.Schema({
    name:{
        Types:String,
        require:true,
    },
    addressLine1:{
        Types:String,
        require:true,
    },
    addressLine2:{
        Types:String,
        require:true,
    },
    city:{
        Types:String,
        require:true,
    },
    pincode:{
        Types:String,
        require:true,
    },
    specializedIn:[
       {
        Types:String,
        require:true,
       }
    ]
    
},{timestamps:true})

export const Hospital = mongoose.model("Hospital",hospitalSchema)