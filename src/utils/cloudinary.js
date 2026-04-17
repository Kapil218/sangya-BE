import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, resourceType) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resourceType || "auto", // Use 'image' or 'video' based on the file type
      transformation:
        resourceType === "video" ? [{ streaming_profile: "hd" }] : undefined,
    });

    // Remove the file from local storage after successful upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;
  } catch (error) {
    console.error(`Cloudinary upload error for ${resourceType}:`, error);

    // Optionally remove the file in case of an error as well
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null; // or handle the error as needed
  }
};

// for streaming in different qualities
const generateVideoUrls = (publicId) => {
  return {
    "144p": cloudinary.url(publicId, {
      resource_type: "video",
      transformation: [
        { width: 256, height: 144, crop: "limit" }, // Adjust width/height for 144p
        { quality: "auto" }, // Automatically adjusts quality
      ],
    }),
    "240p": cloudinary.url(publicId, {
      resource_type: "video",
      transformation: [
        { width: 426, height: 240, crop: "limit" }, // Adjust width/height for 240p
        { quality: "auto" }, // Automatically adjusts quality
      ],
    }),
    "360p": cloudinary.url(publicId, {
      resource_type: "video",
      transformation: [
        { width: 640, height: 360, crop: "limit" }, // Adjust width/height for 360p
        { quality: "auto" }, // Automatically adjusts quality
      ],
    }),
    "480p": cloudinary.url(publicId, {
      resource_type: "video",
      transformation: [
        { width: 854, height: 480, crop: "limit" }, // Adjust width/height for 480p
        { quality: "auto" },
      ],
    }),
    "720p": cloudinary.url(publicId, {
      resource_type: "video",
      transformation: [
        { width: 1280, height: 720, crop: "limit" }, // Adjust width/height for 720p
        { quality: "auto" },
      ],
    }),
    "1080p": cloudinary.url(publicId, {
      resource_type: "video",
      transformation: [
        { width: 1920, height: 1080, crop: "limit" }, // Adjust width/height for 1080p
        { quality: "auto" },
      ],
    }),
  };
};

export { uploadOnCloudinary, generateVideoUrls };
