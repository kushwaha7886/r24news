import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './Src/models/User.model.js';

// Load environment variables
dotenv.config();

async function updateUserRole() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const userEmail = 'news24@gmail.com';

        const user = await User.findOneAndUpdate(
            { email: userEmail },
            { role: 'editor' },
            { new: true }
        ).select('-password -refreshToken');

        if (!user) {
            console.log('User not found with email:', userEmail);
        } else {
            console.log('User role updated to editor:', user);
        }

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error updating user role:', error);
        process.exit(1);
    }
}

updateUserRole();
