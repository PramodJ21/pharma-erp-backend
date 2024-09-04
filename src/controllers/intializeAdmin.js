const mongoose = require('mongoose');
const User = require('../models/User'); // Adjust path as necessary
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Function to create initial admin user
const createInitialAdmin = async () => {
    try {
        // Check if there is already an admin user
        const existingAdmin = await User.findOne({ role: 'Admin' });
        if (existingAdmin) {
            console.log('Admin user already exists. Skipping creation.');
            return;
        }

        // Admin user details
        const username = 'admin'; // Default username
        const password = 'adminpassword'; // Default password; change this after creation
        const role = 'Admin'; // Role as plain string

        // Generate a unique user ID
        const userId = uuidv4(); // Generates a unique ID

        // Hash the password with stronger salt rounds (12)
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create a new admin user object
        const adminUser = new User({
            userId,
            username,
            password: hashedPassword,
            role
        });

        // Save the admin user to the database
        await adminUser.save();

        console.log('Initial admin user created successfully');
    } catch (error) {
        console.error('Error creating initial admin user:', error);
    }
};

// Call the function to create the initial admin when the server starts
module.exports = {createInitialAdmin}
