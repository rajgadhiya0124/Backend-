import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

// Configuration
    cloudinary.config({ 
        cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_APT_SECRET // Click 'View API Keys' above to copy your API secret
    });

    const uploadOnCloudnary =async (localFilePath)=>{
        try {
            if(!localFilePath) return null
            //upolad file on cloudnairy
            const response = await cloudinary.uploader.upload(localFilePath,{
                resource_type: 'auto'
            })
           
            //file as been uploaded sucessfully
            console.log("file is uploaded on cloudnairy",
            response.url);
            fs.unlinkSync(localFilePath)
            console.log(response)
            return response;
        } catch (error) {
            fs.unlinkSync(localFilePath) //remove the locally save temprory file  as uploaded operation got failed
            return null;
        }

    }

    export {uploadOnCloudnary}