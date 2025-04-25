import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const commentSchemma = new Schema(
    {
        content:{
            type:String,
            required:true
        },
        video:{
            type:Schema.Types.ObjectId,
            ref:"Video"
        },
        owner:{
            type:Schema.Types.ObjectId,
            required:"User"
        },
    }
)

commentSchemma.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.model("Comment",commentSchemma)