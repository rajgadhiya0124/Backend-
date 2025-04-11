import mongoose, { Schema, Types } from "mongoose";


const todoSchema = new mongoose.Schema({
  content:{
     Types: String,
     require:true,
   },
   complete:{
      Types:Boolean,
      default:false
   },
   createdBy:{
         Types: mongoose.Schema.Types.ObjectId,
         ref:"User"
   },
   subTodos:[
    {
        Types:mongoose.Schema.Types.ObjectId,
        ref:"SubTodo"
    }
   ]//Array of sub-todos

},{timestamps:true});

export const Todo= mongoose.model("Todo",todoSchema);