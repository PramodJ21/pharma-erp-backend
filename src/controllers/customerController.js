const Customer = require('../models/Customer'); // Adjust the path to your actual model file

// Method to create a new customer


// Method to get a customer by phone number
const getCustomer = async (req, res) => {
    const { customerPhone } = req.params;

    try {
        // Find the customer by phone number
        const customer = await Customer.findOne({phone: customerPhone });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Send the customer data as response
        res.status(200).json({ customer });
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ message: 'An error occurred while fetching the customer' });
    }
};

module.exports = { getCustomer };
