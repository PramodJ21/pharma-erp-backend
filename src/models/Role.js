const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true // Ensure role names are unique
    },
    description: {
        type: String,
        required: false // Optional field
    }
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
