const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

const setupAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ekyam_db');
        console.log('Connected to MongoDB');

        const email = 'perfectpandey03473@gmail.com';
        const password = '123456';
        const username = 'admin';
        const fullName = 'Admin User';

        // Check if user exists
        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            // Update existing user
            console.log('Admin user exists. Updating...');
            user.userType = 'system_admin';
            user.isVerified = true;
            user.password = password; // Will be hashed by pre-save hook
            user.verificationOTP = null;
            user.otpExpiresAt = null;
            await user.save();
            console.log('✓ Admin user updated successfully');
        } else {
            // Create new admin user
            console.log('Creating new admin user...');
            user = await User.create({
                username,
                email: email.toLowerCase(),
                password,
                fullName,
                userType: 'system_admin',
                isVerified: true,
                verificationOTP: null,
                otpExpiresAt: null,
            });
            console.log('✓ Admin user created successfully');
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Admin Setup Complete');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`Username: ${username}`);
        console.log(`User Type: system_admin`);
        console.log(`Verified: true`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error setting up admin:', error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
};

setupAdmin();
