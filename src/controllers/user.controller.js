import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "..//utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // getting data from frontend
  const { username, email, password, fullName } = req.body;

  // validation check
  if (
    [username, email, password, fullName].some((field) => field?.trim == "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check the user already present or not
  const exisetedUser =await User.findOne({
    $or: [{ username }, { email }],
  });
  if (exisetedUser) {
    throw new ApiError(409, "User with username or email already exists");
  }

  // for file uploading we have acces of file method in our request because files are stored on our server now
  // const avatarLocalpath = req.files?.avatar[0]?.path;
  // const coverImageLocalpath = req.files?.coverImage[0]?.path;
  // console.log(avatarLocalpath,coverImageLocalpath);  

  // if (!avatarLocalpath) {
  //   throw new ApiError(409, "avatar file is required");
  // }
  const avatarLocalPath = req.files?.avatar?.[0]?.path;

if (!avatarLocalPath) {
  throw new ApiError(400, "Avatar file is required");
}

const avatar = await uploadOnCloudinary(avatarLocalPath);

// Upload cover image only if it exists
let coverImage = null;
if (req.files?.coverImage?.[0]?.path) {
  coverImage = await uploadOnCloudinary(req.files.coverImage[0].path);
}

  // const avatar  = await uploadOnCloudinary(avatarLocalpath);
  // const coverImage  = await uploadOnCloudinary(coverImageLocalpath);

  // if (!avatar) {
  //   throw new ApiError(409, "avgatar file is required");
  // }
  
  // creating an user object and make entry in db
  const user = await User.create({
    fullName,
    email,
    username:username.toLowerCase(),
    password,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    
  })
   const createdUser =    await User.findById(user._id).select("-password -refreshToken")
   if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering the user")
   }

  //  return response
  return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"))
});

export { registerUser };
