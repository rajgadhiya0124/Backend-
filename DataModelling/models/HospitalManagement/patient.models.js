import mongoose, { Types } from "mongoose";

const patientSchema = new mongoose.Schema({
    name:{
        Types:String,
        require:true
    },
    daigonsedWith:{
        Types:String,
        require:true
    },
    address:{
        Types:String,
        require:true
    },
    age:{
        Types:Number,
        require:true
    },
    bloodGroup:{
        Types:String,
        require:true
    },
    gender:{
        Types:String,
        enum:["M","F","O"],
        require:true
    },
    admittedIn:{
        Types:mongoose.Schema.Types.ObjectId,
        ref:"Hospital"
    },
},{timestamps:true})

export const Patient = mongoose.model("Patient",patientSchema)