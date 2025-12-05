const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3001;

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());

// --- In-Memory Database (for demonstration) ---
// In a production environment, you would use a real database like MongoDB, PostgreSQL, etc.
let users = [];
let orders = [];

// --- API Endpoints ---

/**
 * @route POST /api/users/register
 * @desc Registers a new user.
 * @access Public
 */
app.post('/api/users/register', (req, res) => {
    const { username, email, phone } = req.body;

    // Basic Validation
    if (!username || !email || !phone) {
        return res.status(400).json({ message: 'Please provide username, email, and phone.' });
    }
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const newUser = {
        id: uuidv4(),
        username,
        email,
        phone,
        billingAddress: null, // Address will be added later
        createdAt: new Date(),
    };

    users.push(newUser);
    console.log('User Registered:', newUser);
    console.log('All Users:', users);

    res.status(201).json({
        message: 'User registered successfully!',
        user: { id: newUser.id, username, email, phone, billingAddress: null },
    });
});


/**
 * @route PUT /api/users/:userId/address
 * @desc Adds or updates the billing address for a user.
 * @access Private (conceptually)
 */
app.put('/api/users/:userId/address', (req, res) => {
    const { userId } = req.params;
    const addressData = req.body;

    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found.' });
    }

    // Validation for address fields can be added here
    users[userIndex].billingAddress = addressData;
    console.log(`Address updated for user ${userId}:`, addressData);
    console.log('All Users:', users);

    res.status(200).json({ message: 'Address updated successfully.' });
});

/**
 * @route POST /api/orders
 * @desc Creates a new order.
 * @access Private (conceptually)
 */
app.post('/api/orders', (req, res) => {
    const { userId, products, totalPrice, shippingAddress } = req.body;

    if (!userId || !products || !totalPrice || !shippingAddress) {
        return res.status(400).json({ message: 'Missing required order information.' });
    }
    
    if (!users.find(u => u.id === userId)) {
        return res.status(404).json({ message: 'User not found.' });
    }

    const newOrder = {
        orderId: uuidv4(),
        userId,
        products,
        totalPrice,
        shippingAddress,
        status: 'Pending',
        createdAt: new Date(),
    };

    orders.push(newOrder);
    console.log('Order Created:', newOrder);
    console.log('All Orders:', orders);

    res.status(201).json({
        message: 'Order created successfully!',
        order: {
            orderId: newOrder.orderId,
            userId: newOrder.userId,
            totalPrice: newOrder.totalPrice,
        },
    });
});

// --- Server Start ---
app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});
