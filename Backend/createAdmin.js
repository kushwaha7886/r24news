import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { User } from './Src/models/User.model.js';

// Load environment variables
dotenv.config();

async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if user with this email already exists
        const existingUser = await User.findOne({ email: 'kushwaha7886@gmail.com' });

        if (existingUser) {
            // Update existing user to admin and set password
            existingUser.role = 'admin';
            existingUser.password = 'P@ssword1237886'; // This will be hashed by pre-save hook
            await existingUser.save();
            console.log('Existing user updated to admin with new password:', existingUser.email);
        } else {
            // Create the first admin user
            const adminUser = await User.create({
                fullName: 'Ravi Kushwaha',
                email: 'kushwaha7886@gmail.com',
                username: '@kushwaha7886',
                password: 'P@ssword1237886',
                role: 'admin'
            });

            const createdAdmin = await User.findById(adminUser._id).select('-password -refreshToken');

            if (!createdAdmin) {
                console.log('Something went wrong while creating the admin');
            } else {
                console.log('Admin created successfully:', createdAdmin);
            }
        }

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();
