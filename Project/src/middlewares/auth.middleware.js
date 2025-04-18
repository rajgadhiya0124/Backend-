import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import JWT, { decode } from "jsonwebtoken"

export const verifyJWT = asyncHandler(async(req,res,next)=>{
   try {
    const token =  req.cookies?.accessToken  || req.header("Authorization").replace("Bearer ","")
 
    if(!token){
     throw new ApiError(401,"Unauthorized request")
    }
 
    const decodedToken = JWT.verify(token,process.env.ACCESS_TOKEN_SECRET)
 
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
 
    if(!user){
     throw new ApiError(401,"invalid Access Token")
    }
 
    req.user = user;
    next()

   } catch (error) {
     throw new ApiError(401,error?.message || "Invalid Access Token")
   }
})