import mongoose, { Types }  from "mongoose";

const subTodoSchema = new mongoose.Schema({
    content:{
        Types:String,
        require:true
    },
    complete:{
        Types:Boolean,
        default:false,
    },
    createdBy:{
        Types:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true});

export const subTodo = mongoose.model("SubTodo",subTodoSchema)