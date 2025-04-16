import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js";
import {User} from "../models/user.models.js";
import { uploadOnCloudnary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { response } from "express";

const genrateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.genrateAccessToken()
        const refreshToken = user.genrateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
  
        return{accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"somthing went wrong while genrating refresh and access token")
    }
}

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

    const {fullName,email,username,password} =req.body

    if([fullName,email,username,password].some((field)=>
       field?.trim() === "")) 
    {
        throw new ApiError(400,"All fields are required ")    
    }
  

    const existedUser = await User.findOne({
        $or:[{ username },{ email }]
    })
    if(existedUser){
        throw new ApiError(409,"User with username or email is already exists")
    }
    
    const avatarLocalPath =  req.files?.avatar[0]?.path;
    // const coverImageLocalPath= req.files?.coverImage[0]?.path; 
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files?.coverImage[0]?.path;
    }
    console.log(req.files)

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar = await uploadOnCloudnary(avatarLocalPath)
    const coverImage = await uploadOnCloudnary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })


    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registring the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registerd successfully")
    )
})

//login

const loginUser = asyncHandler(async(req,res)=>{
   //req body ->data
   //username or email
   //find the user
   //password check
   //access and refreshtoken
   //send cookie
   
   const {email,username,password}= req.body

    if(!username && !email){
       throw new ApiError(400,"usernme or password is required")
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new ApiError(404,"User dose not exist")
    }

    const isPasswordValid= await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"invalid user credentailas")
    }

    const {accessToken,refreshToken} =await genrateAccessAndRefreshTokens(user._id)
     
    const loggedInUser = await User.findById(user._id)
    .select("-passeord -refreshToken")

    const options = {
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User is logged In Successfully"
        )
    )
})
  
const logoutUser = asyncHandler(async(req,res)=>{
    User.findByIdAndUpdate(
        req.user._id,
    {
        $set:{refreshToken:undefined},
    },
    {
        new:true
    })

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logout"))

})

//create a new access token ady=ter access token expairy
const refreshAccessToken = asyncHandler(async(req,res)=>{
   const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

   if(!incomingRefreshToken){
    throw new ApiError(401,"unauthoerized request")
   }

   try {
    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
 
    const user = await User.findById(decodedToken?._id)
    
    if(!user){
     throw new ApiError(401,"invalid refresh token")
    }
 
    //match incoming token from user and encrypt tokrn store in DB
 
    if(incomingRefreshToken !== user?.refreshToken){
     throw new ApiError(401,"refresh token is expired or used")
    }
    //genrating new accesstoken
 
    const options={
     httpOnly:true,
     secure:true
    }
    const {accessToken,newrefreshToken}= await genrateAccessAndRefreshTokens(user._id)
    
    return res
    .status(200)
    .cookie("accessToken",accessToken)
    .cookie("refreshToken",newrefreshToken)
    .json(
     new ApiResponse(
         200,
         {accessToken,newrefreshToken},
         "Access Token refreshed"
     )
    )
   } catch (error) {
       throw ApiError(401,error?.message || "Invalid refresh Token")
   }
}) 


export {registerUser,loginUser,logoutUser,refreshAccessToken}