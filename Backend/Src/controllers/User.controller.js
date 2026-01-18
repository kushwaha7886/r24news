import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { User } from "../models/User.model.js";

import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { sendEmail } from "../../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";




const generateAccessAndRefreshTokens = async(userId) =>{

    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    req.body = req.body || {};
    const {fullName, email, username, password } = req.body;
    const role = "reader"; // Always set to reader for registration
    // console.log("email: ", email);

    // For editors, username is optional and will be auto-generated from email if not provided
    let finalUsername = username;
    if (role === 'editor' && !username) {
        finalUsername = 'editor_' + email.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }

    const requiredFields = [fullName, email, password];
    if (role === 'user') requiredFields.push(username);

    if (requiredFields.some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username: finalUsername }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarFile = req.files?.find(file => file.fieldname === 'avatar');
    const avatarLocalPath = avatarFile?.path;

    let avatarUrl = null;
    if (avatarLocalPath) {
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        if (avatar) {
            avatarUrl = avatar.url;
        }
    }


    const user = await User.create({
        fullName,
        avatar: avatarUrl,
        email,
        password,
        username: finalUsername.toLowerCase(),
        role
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        }

    return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: createdUser,
                accessToken,
                refreshToken
            },
            "User registered Successfully"
        )
    )

} );

const loginUser = asyncHandler(async (req, res) =>{
    req.body = req.body || {};
    const {email, username, password} = req.body
   

    if (!username?.trim() && !email?.trim()) {
        throw new ApiError(400, "username or email is required")
    }

    if (!password) {
        throw new ApiError(400, "password is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")



    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        }

        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    req.body = req.body || {};
    const {oldPassword, newPassword} = req.body

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "oldPassword and newPassword are required")
    }

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})


const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    if (!req.body) {
        throw new ApiError(400, "Request body is required");
    }
    const {fullName, email} = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const updateUserAvatar = asyncHandler(async(req, res) => {
    console.log('Avatar update request from user:', req.user?.role, req.user?._id);
    console.log('File received:', req.file);

    const avatarLocalPath = req.file?.path
    console.log('Avatar local path:', avatarLocalPath);

    if (!avatarLocalPath) {
        console.log('No avatar file path found');
        throw new ApiError(400, "Avatar file is missing")
    }

    //TODO: delete old image - assignment

    console.log('Uploading to Cloudinary...');
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    console.log('Cloudinary response:', avatar);

    if (!avatar.url) {
        console.log('No avatar URL from Cloudinary');
        throw new ApiError(400, "Error while uploading on avatar")

    }

    console.log('Updating user in database...');
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    console.log('User updated successfully:', user?.avatar);

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                email: 1

            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})



const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, users, "Users fetched successfully")
    );
});

const getJournalists = asyncHandler(async (req, res) => {
    const journalists = await User.find({ role: 'journalist' }).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, journalists, "Journalists fetched successfully")
    );
});

const forgotPassword = asyncHandler(async(req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }
    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User with this email does not exist");
    }

    // Generate a password reset token
    const resetToken = user.generateResetToken();

    // Send the reset token to the user's email
    await sendEmail({
        to: user.email,
        subject: "Password Reset",
        text: `Your password reset token is: ${resetToken}`
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, null, "Password reset email sent successfully")
        );
});

const createAdmin = asyncHandler(async (req, res) => {
    req.body = req.body || {};
    const { fullName, email, username, password } = req.body;
    const role = "admin"; // Always set to admin for this endpoint

    const requiredFields = [fullName, email, password, username];

    if (requiredFields.some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarFile = req.files?.find(file => file.fieldname === 'avatar');
    const avatarLocalPath = avatarFile?.path;

    let avatarUrl = null;
    if (avatarLocalPath) {
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        if (avatar) {
            avatarUrl = avatar.url;
        }
    }

    const user = await User.create({
        fullName,
        avatar: avatarUrl,
        email,
        password,
        username: username.toLowerCase(),
        role
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the admin")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            {
                user: createdUser
            },
            "Admin created Successfully"
        )
    )
});
const updateUserRole = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !["reader", "journalist", "editor", "admin"].includes(role)) {
        throw new ApiError(400, "Invalid role specified");
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "User role updated successfully")
    );
});

const adminResetPassword = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Generate a password reset token
    const resetToken = user.generateResetToken();

    // Send the reset token to the user's email
    await sendEmail({
        to: user.email,
        subject: "Password Reset by Admin",
        text: `Your password has been reset by an administrator. Please use the following link to set a new password: ${process.env.FRONTEND_URL}/reset-password/${resetToken}`
    });

    return res.status(200).json(
        new ApiResponse(200, null, "Password reset email sent to user")
    );
});

const createJournalist = asyncHandler(async (req, res) => {
    req.body = req.body || {};
    const { name, email, designation, bio } = req.body;
    const role = "journalist";

    // Generate username from email
    const username = 'journalist_' + email.toLowerCase().replace(/[^a-z0-9]/g, '_');

    // Generate a default password (user should change it)
    const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    const requiredFields = [name, email];

    if (requiredFields.some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Name and email are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const profileImageFile = req.files?.find(file => file.fieldname === 'profileImage');
    const profileImageLocalPath = profileImageFile?.path;

    let avatarUrl = null;
    if (profileImageLocalPath) {
        const avatar = await uploadOnCloudinary(profileImageLocalPath);
        if (avatar) {
            avatarUrl = avatar.url;
        }
    }

    const user = await User.create({
        fullName: name,
        avatar: avatarUrl,
        email,
        password,
        username: username.toLowerCase(),
        role
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating the journalist")
    }

    // Send email with login credentials
    try {
        await sendEmail({
            to: user.email,
            subject: "Journalist Account Created",
            text: `Your journalist account has been created.\n\nUsername: ${username}\nPassword: ${password}\n\nPlease log in and change your password immediately.`
        });
    } catch (emailError) {
        console.error("Failed to send welcome email:", emailError.message);
        // Don't throw error for email failure, just log it
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            {
                user: createdUser
            },
            "Journalist created Successfully"
        )
    )
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const user = await User.findById(userId).populate({
        path: 'watchHistory',
        populate: {
            path: 'author',
            select: 'fullName avatar username'
        }
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return res.status(200).json(
        new ApiResponse(200, user.watchHistory, "Watch history fetched successfully")
    );
});

const deleteJournalist = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await User.findOneAndDelete({ _id: id, role: 'journalist' });

    if (!user) {
        throw new ApiError(404, "Journalist not found");
    }
    return res.status(200).json(
        new ApiResponse(200, {}, "Journalist deleted successfully")
    );
});


export {
     getUsers,
     getJournalists,
    forgotPassword,
    createAdmin,
    updateUserRole,
    adminResetPassword,
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    getUserChannelProfile,
    getWatchHistory,
    createJournalist,
    deleteJournalist

};
