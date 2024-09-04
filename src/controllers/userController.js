const User = require('../models/User');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Create a new user
const createUser = async (req, res) => {
    const { username, password, role } = req.body;

    try {
        // Validate role
        const validRoles = ['Admin', 'Sales Operator', 'Purchase', 'Manufacturer'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Generate a unique user ID
        const userId = uuidv4(); // Generates a unique ID

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create a new user object
        const newUser = new User({
            userId, // Assign the unique user ID
            username,
            password: hashedPassword,
            role
        });

        // Save the new user to the database
        await newUser.save();

        res.status(201).json({ message: 'User created successfully', userId });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createUser
};


// Get all users
const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a user by ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a user by ID
const updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a user by ID
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
};
    