import mongoose, { Types } from "mongoose";


const docterSchema = new mongoose.Schema({
    name:{
        Types:String,
        require:true
    },
    salary:{
        Types:Number,
        require:true
    },
    qualification:{
        Types:String,
        require:true
    },
    exprienceInYears:{
        Types:String,
        default:0
    },
    worksInHospital:{
        Types:mongoose.Schema.Types.ObjectId,
        ref:"Hospital",
        require:true
    },

},{timestamps:true})

export const Docter = mongoose.model("Docter",docterSchema)