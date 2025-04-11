import mongoose, { Types } from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        Types:String,
        require:true,
        unique:true,
        lowercase:true
    },
    email: {
        Types:String,
        require:true,
        unique:true,
        lowercase:true
        },
    password:{
        Types:String,
        require:true
    }
},{timestamps:true})


export const User= mongoose.model("User",userSchema)