import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js";
import {User} from "../models/user.models.js";
import { uploadOnCloudnary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { response } from "express";

const registerUser = asyncHandler(async(req,res)=>{
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {fullname,email,username,password} =req.body
    console.log("email:",email)

    if([fullname,email,username,password].some((field)=>
       field?.trim() === "")) 
    {
        throw new ApiError(400,"All fields are required ")    
    }
  

    const existedUser = User.findOne({
        $or:[{ username },{ email }]
    })
    if(existedUser){
        throw new ApiError(409,"User with username or email is already exists")
    }
    
    const avatarLocalPath =  req.files?.avatar[0]?.path;
    const coverImageLocalPath= req.files?.coverImage[0]?.path; 

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar = await uploadOnCloudnary(avatarLocalPath)
    const coverImage = await uploadOnCloudnary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(username._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registring the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registerd successfully")
    )
})

export {registerUser}