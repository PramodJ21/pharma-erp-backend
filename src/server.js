const express = require('express');
const app = express();
const cors = require("cors")
const connectDB = require('./config/db');
const credentials = require('./middleware/credentials')
const corsOptions = require('./config/corsOptions')
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const salesRoutes = require('./routes/salesRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const manufacturingRoutes = require('./routes/manufacturingRoutes');
const recipeRoutes = require('./routes/recipeRoutes')
const userRoutes = require('./routes/userRoutes')
const customerRoutes = require('./routes/customerRoutes')
const { verifyToken,authorizeRoles } = require('./middleware/authMiddleware');
const {createInitialAdmin} = require('./controllers/intializeAdmin')
//Connect to the database
connectDB()
createInitialAdmin()

// CORS
app.use(credentials)
app.use(cors(corsOptions))

// Middleware to parse incoming requests with JSON payloads
app.use(express.json());

// Use the routes
app.use('/auth', authRoutes);

//verify authToken
// app.use(verifyToken)
app.use('/sales', salesRoutes);
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/manufacturing', manufacturingRoutes)
app.use('/recipes',recipeRoutes)
app.use('/customer',customerRoutes)
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
