import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js";
import {User} from "../models/user.models.js";
import { uploadOnCloudnary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { response } from "express";
import mongoose from "mongoose";

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
    .select("-passeword -refreshToken")

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

//create a new access token after access token expairy
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

const changeCurrentPassword = asyncHandler(async(req,res)=>{
      const {oldPassword,newPassword}= req.body

      const user =await User.findOne(req.user?._id)
      const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

      if(!isPasswordCorrect){
        throw new ApiError(400,"invalid Old Password")
      }
      
      user.password = newPassword
      await user.save({validateBeforeSave:false})
      
      return response.status(200)
      .json(new ApiResponse(200),{},"Password change sucessfully")
   })

const getCurrentUser = asyncHandler(async(req,res)=>{
        return res
        .status(200)
        .json(200,req.user,"current user fetched successfully")
   })

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName,email} = req.body

    if(!fullName || !email){
        throw new ApiError(400,"All felids are require")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName:fullName,
                email:email
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status
    .json(new ApiResponse(200,user,"Account details updated sucessfully"))
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatra File is missing")
    }

    const avatar = await uploadOnCloudnary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiResponse(400,"error while uploading on avatar")
    }
    
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{avatar:avatar.url}
        },
        {new:true}
    ).select("-password")
    
    return res
    .status(200)
    .json(new ApiResponse(200,user,"Avatar image uodated sucessfully"))
})

const updateCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath){
        throw new ApiError(400, "CoverImage is missing")
    }

    const coverImage = await uploadOnCloudnary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiResponse(400,"error while uploading on coverimage")
    }
    
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{coverImage:coverImage.url}
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Cover image uodated sucessfully"))
})

const getUserChannelPorofile = asyncHandler(async(req,res)=>{
    const {username}=req.params

    if(!username){
        throw new ApiResponse(400,"username is missing")
    }
    
    const channel = await User.aggregate([
        {   
            $match:{username:username?.toLowerCase()}
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }

        },
        {
            $addFields:{
                subscriberCount:{
                    $size:{subscribers}
                },
                channelsSubscribedToCount:{
                     $size:{subscribedTo}
                },
                isSubscribed:{
                   $cond:{
                       if:{$in: [req.user?._id,"$subscribers.subscriber"]},
                       then:true,
                       else:false
                   }
                }
            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                subscriberCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                coverImage:1,
                email:1,
                avatar:1,
                email:1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404,"channel dose mot exists")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,channel[0],"user channel fetched sucessfully")
    )
})

const getwatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },{
            $lookup:{
                from:"vidos",
                localField:"watchHistory",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                      $addFields:{
                        owner:{
                            $first:"$owner"
                        }
                      }  
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new response(200,user[0].watchHistory,
            "whatch history fetched sucessfully"
        )
    )
})
export {registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateCoverImage,
    getUserChannelPorofile,
    getwatchHistory
}
