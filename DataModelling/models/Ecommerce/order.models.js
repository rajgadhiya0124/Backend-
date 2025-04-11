import mongoose, { Types } from "mongoose";

const OrderIteamSchema = new mongoose.Schema({
    productId:{
        Types: mongoose.Schema.Types.ObjectId,
        ref:"Product"
    },
    quantity:{
        Types:Number,
        required:true
    }
})

const orderSchema = new mongoose.Schema({
    orderprice:{
    Types:Number,
    required:true,
    },
    customer:{
      Types:mongoose.Schema.Types.ObjectId,
      ref:"User"
    },
    orderItems:{
        Types:[OrderIteamSchema]
    },
    address:{
        Types:String,
        required:true
    },
    status:{
        Types:String,
        enum:["pending","cancle","delivered"],
        default:"pending"
    }
},{timestamps:true});

export const Order = mongoose.model("Order",orderSchema)  