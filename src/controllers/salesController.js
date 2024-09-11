const Customer = require('../models/Customer');
const SalesTransaction = require('../models/SalesTransaction');
const Product = require('../models/Product');
const {updateInventoryOnSale} = require('../controllers/inventoryController')
const { v4: uuidv4 } = require('uuid');
// Record a new sale
const createSalesTransaction = async (req, res) => {
    const { phone, products } = req.body;
    
    const salesDate = new Date().toISOString().split('T')[0];
    try {
        // Check if customer exists
        let customer = await Customer.findOne({ phone: phone });
        
        // Create new customer if not found
        if (!customer) {
            const {name,email} = req.body
            customer = new Customer({
               name,
               email,
               phone
            });
            await customer.save();
        }

        // Prepare items for sales transaction
        const items = [];
        let fullTotalAmount = 0;

        for (const product of products) {
            const { productName, quantity, salesPrice } = product;
            const totalAmount = quantity*salesPrice
            // Fetch product ID by name
            const productData = await Product.findOne({ productName });
            if (!productData) {
                return res.status(400).json({ message: `Product ${productName} not found` });
            }

            // Add to items list
            items.push({
                productId: productData.productId,
                quantity,
                totalAmount
            });

            // Accumulate total amount
            fullTotalAmount += totalAmount;
            await updateInventoryOnSale(productData.productId,productData.productName,quantity)
        }

        // Create a sales transaction
        const transactionId = uuidv4(); // Generate unique transaction ID
        const salesTransaction = new SalesTransaction({
            transactionId,
            customerId: customer._id,
            items,
            fullTotalAmount,
            salesDate
        });

        // Save the sales transaction to the database
        await salesTransaction.save();
        
        res.status(201).json({ message: 'Sales transaction created successfully', transactionId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all sales
const getSalesTransactions = async (req, res) => {
    const { startDate, endDate, productId } = req.body;

    try {
        // Find sales transactions within the given date range
        const salesTransactions = await SalesTransaction.find({
            salesDate: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        });

        // Initialize an array to store formatted sales transaction data
        const salesTransactionData = [];

        const fetchSalesTransactionsData = async () => {
            // Use Promise.all to wait for all customer and product fetching operations
            await Promise.all(
                salesTransactions.map(async (transaction) => {
                    const customer = await Customer.findById(transaction.customerId);
                    const customerName = customer ? customer.name : 'Unknown';

                    // Determine if all products should be included or filtered by productId
                    const itemsToProcess = productId === 'all' 
                        ? transaction.items  // Include all items if productId is 'all'
                        : transaction.items.filter(item => item.productId === productId); // Otherwise, filter by specific productId

                    // Use Promise.all for fetching products for each transaction
                    const itemPromises = itemsToProcess.map(async (item) => {
                        const product = await Product.findOne({ productId: item.productId });

                        salesTransactionData.push({
                            transactionId: transaction.transactionId,
                            customerName,
                            productName: product ? product.productName : 'Unknown',
                            quantity: item.quantity,
                            totalAmount: item.totalAmount,
                            salesDate: transaction.salesDate,
                        });
                    });

                    await Promise.all(itemPromises); // Wait for all items to be processed
                })
            );
        };

        // Call the function and wait for all data to be fetched
        await fetchSalesTransactionsData();

        function aggregateSalesDataByDate(data) {
            const aggregatedData = {};
          
            data.forEach((sale) => {
              const date = new Date(sale.salesDate).toISOString().split('T')[0]; // Get only the date part
              if (aggregatedData[date]) {
                aggregatedData[date] += sale.quantity;
              } else {
                aggregatedData[date] = sale.quantity;
              }
            });
          
            // Convert to array format for charting
            return Object.entries(aggregatedData).map(([date, quantity]) => ({ date, quantity }));
          }

        // Aggregate sales data by date
        const aggregatedSalesData = aggregateSalesDataByDate(salesTransactionData);

        // Send the response after all data has been fetched and processed
        res.status(200).json({ salesTransactionData, aggregatedSalesData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




// Get a sale by ID
const getSaleById = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id);
        if (!sale) return res.status(404).json({ message: 'Sale not found' });
        res.json(sale);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a sale by ID
const updateSale = async (req, res) => {
    try {
        const sale = await Sale.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!sale) return res.status(404).json({ message: 'Sale not found' });
        res.json(sale);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a sale by ID
const deleteSale = async (req, res) => {
    try {
        const sale = await Sale.findByIdAndDelete(req.params.id);
        if (!sale) return res.status(404).json({ message: 'Sale not found' });
        res.json({ message: 'Sale deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createSalesTransaction,
    getSalesTransactions,
    getSaleById,
    updateSale,
    deleteSale
};
