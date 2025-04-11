import mongoose, { Types } from "mongoose";

const productsSchema = new mongoose.Schema({

    description:{
        Types:String,
        required:true,
    },
    name:{
        Types:String,
        required:true,
    },
    productImage:{
        Types:String,
    },
    price:{
        Types:Number,
        default:0
    },
    stock:{
        default:0,
        Types:Number
    },
    category:{
        Types:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true
    },
    owner:{
        Type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Product = mongoose.model("Product",productsSchema)