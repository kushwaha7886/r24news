import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/User.model.js";



export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        // Try to find user first
        let user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }

        // Check if user is admin or editor based on role
        if (user.role === 'admin') {
            user.isAdmin = true;
        }
        if (user.role === 'editor' || user.role === 'admin') {
            user.isEditor = true;
        }

        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }

})

// Middleware to check if user is an admin
export const requireAdmin = asyncHandler(async(req, res, next) => {
    if (!req.user?.isAdmin) {
        throw new ApiError(403, "Access denied. Admin privileges required.")
    }
    next()
})

// Middleware to check if user is an editor or admin
export const requireEditor = asyncHandler(async(req, res, next) => {
    if (!req.user?.isEditor) {
        throw new ApiError(403, "Access denied. Editor or Admin privileges required.")
    }
    next()
})


export const verifyToken = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");  
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});
export const verifyRole = (allowedRoles) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            throw new ApiError(403, "Access denied. Insufficient privileges.");
        }
        next();
    });
};