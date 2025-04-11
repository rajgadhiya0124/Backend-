import mongoose, { Types } from "mongoose";

const categorySchema = new mongoose.Schema({
   name:{
        Types:String,
        required:true
    },

},{timestamps:true})

export const Category= mongoose.model("Category",categorySchema)