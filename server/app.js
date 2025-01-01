const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

const SECRET_KEY = 'superSecret!Key#123456';

// Enable CORS
app.use(cors());

// Your other middleware

// Middleware
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Your MySQL username
    password: '', // Your MySQL password
    database: 'OnlineShoppingSystem' // Database name
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ', err.stack);
        return;
    }
    console.log('Connected to database');
});
const authenticate = (req, res, next) => {
    // Retrieve the token from the headers
    const token =
        req.headers['authorization'] || // lowercase authorization
        req.headers['Authorization'];  // uppercase Authorization

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Remove 'Bearer ' prefix if present
    const formattedToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token;
    console.log(formattedToken)

    try {
        // Verify the token
        const decoded = jwt.verify(formattedToken, SECRET_KEY);
        req.userId = decoded.userId; // Attach the user ID from the token to the request
        next(); // Proceed to the next middleware or route
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token.' });
    }
};

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the Online Shopping System API');
});

// Fetch all products
app.get('/products', (req, res) => {
    const query = `
        SELECT p.product_id, p.product_name, p.product_price, c.category_name, s.supplier_name 
        FROM Product p
        JOIN Category c ON p.category_id = c.category_id
        JOIN Supplier s ON p.supplier_id = s.supplier_id
        GROUP BY p.product_id, c.category_name, s.supplier_name
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});
// Fetch all customers
app.get('/customers', (req, res) => {
    const query = 'SELECT * FROM Customer';
    db.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.get('/customers/:id', (req, res) => {
    const query = 'SELECT * FROM Customer WHERE customer_id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});


// Add a new product
app.post('/product', (req, res) => {
    const { category_id, supplier_id, product_name, product_description, product_price, stock } = req.body;
    const query = `INSERT INTO Product (category_id, supplier_id, product_name, product_description, product_price, stock) 
                   VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(query, [category_id, supplier_id, product_name, product_description, product_price, stock], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json({ message: 'Product added successfully', productId: result.insertId });
    });
});

app.get('/products/category/:name', (req, res) => {
    const query = `
        SELECT p.product_id, p.product_name, p.product_price, c.category_name
        FROM Product p
        JOIN Category c ON p.category_id = c.category_id
        WHERE c.category_name = ?
    `;
    db.query(query, [req.params.name], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});
app.get('/orders', (req, res) => {
    const query = `
        SELECT o.order_id, o.order_date, o.total_price, CONCAT(c.first_name, ' ', c.last_name) AS customer_name
        FROM Orders o
        JOIN Customer c ON o.customer_id = c.customer_id
        GROUP BY o.order_id, c.first_name, c.last_name
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// Fetch order details grouped by order ID
app.get('/orders/:id', (req, res) => {
    const query = `
        SELECT oi.order_id, p.product_name, SUM(oi.quantity) AS total_quantity, SUM(oi.price) AS total_price
        FROM OrderItem oi
        JOIN Product p ON oi.product_id = p.product_id
        WHERE oi.order_id = ?
        GROUP BY oi.order_id, p.product_name
    `;
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});
app.get('/cart/:customerId', (req, res) => {
    const query = `
        SELECT ci.cart_id, p.product_name, SUM(ci.quantity) AS total_quantity, SUM(p.product_price * ci.quantity) AS total_price
        FROM Cart c
        JOIN CartItem ci ON c.cart_id = ci.cart_id
        JOIN Product p ON ci.product_id = p.product_id
        WHERE c.customer_id = ?
        GROUP BY ci.cart_id, p.product_name
    `;
    db.query(query, [req.params.customerId], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});
app.get('/cart', authenticate, (req, res) => {
    const userId = req.userId; // Extracted from the token

    const query = `
        SELECT ci.cart_id, ci.quantity, p.product_name, p.product_price
        FROM Cart c
        JOIN CartItem ci ON c.cart_id = ci.cart_id
        JOIN Product p ON ci.product_id = p.product_id
        WHERE c.customer_id = ?
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to retrieve cart items', details: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No items in the cart' });
        }

        res.json(results);
    });
});
app.post('/cart', authenticate, (req, res) => {
    const userId = req.userId; // Extracted from JWT token
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
        return res.status(400).json({ error: 'Product ID and quantity are required' });
    }

    // Check if the cart exists for the user
    const checkCartQuery = `SELECT cart_id FROM Cart WHERE customer_id = ?`;
    db.query(checkCartQuery, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error', details: err });

        let cartId;

        if (results.length > 0) {
            cartId = results[0].cart_id;
        } else {
            // Create a new cart if one doesn't exist
            const createCartQuery = `INSERT INTO Cart (customer_id) VALUES (?)`;
            db.query(createCartQuery, [userId], (err, result) => {
                if (err) return res.status(500).json({ error: 'Failed to create cart', details: err });
                cartId = result.insertId;
                addCartItem(cartId);
            });
            return;
        }

        // Add the item to the cart
        addCartItem(cartId);
    });

    const addCartItem = (cartId) => {
        const addItemQuery = `
            INSERT INTO CartItem (cart_id, product_id, quantity)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
        `;

        db.query(addItemQuery, [cartId, product_id, quantity], (err, result) => {
            if (err) return res.status(500).json({ error: 'Failed to add item to cart', details: err });
            res.json({ message: 'Item added to cart successfully' });
        });
    };
});


app.get('/wishlist', authenticate, (req, res) => {
    const userId = req.userId; // Extracted from JWT token

    const query = `
        SELECT w.wishlist_id, p.product_name, p.product_price
        FROM Wishlist w
        JOIN Product p ON w.product_id = p.product_id
        WHERE w.customer_id = ?
        GROUP BY w.wishlist_id, p.product_name, p.product_price
    `;
    db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to retrieve wishlist items', details: err });

        if (results.length === 0) {
            return res.status(404).json({ message: 'No items in the wishlist' });
        }

        res.json(results);
    });
});
app.post('/wishlist', authenticate, (req, res) => {
    const userId = req.userId; // Extracted from JWT token
    const { product_id } = req.body;

    if (!product_id) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    const query = `
        INSERT INTO Wishlist (customer_id, product_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP
    `;

    db.query(query, [userId, product_id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to add item to wishlist', details: err });
        res.json({ message: 'Item added to wishlist successfully' });
    });
});
app.delete('/wishlist/:wishlistId', authenticate, (req, res) => {
    const { wishlistId } = req.params;

    const query = `
        DELETE FROM Wishlist
        WHERE wishlist_id = ?
    `;

    db.query(query, [wishlistId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to remove item from wishlist', details: err });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Wishlist item not found' });
        }

        res.json({ message: 'Item removed from wishlist successfully' });
    });
});

app.get('/payments/:orderId', (req, res) => {
    const query = `
        SELECT p.payment_id, p.payment_date, p.payment_amount, p.payment_method
        FROM Payment p
        WHERE p.order_id = ?
        GROUP BY p.payment_id
    `;
    db.query(query, [req.params.orderId], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});
app.get('/suppliers', (req, res) => {
    const query = 'SELECT * FROM Supplier';
    db.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    // Query the database for the user
    const query = 'SELECT * FROM Customer WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).send(err);

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = results[0];
        const isPasswordValid = (password== user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.customer_id }, SECRET_KEY, { expiresIn: '5h' });

        res.json({ message: 'Login successful', token });
    });
});
app.get('/cart/total', authenticate, (req, res) => {
    const userId = req.userId; // Extracted from JWT token

    const query = `
        SELECT c.cart_id, SUM(ci.quantity * p.product_price) AS total_price
        FROM Cart c
        JOIN CartItem ci ON c.cart_id = ci.cart_id
        JOIN Product p ON ci.product_id = p.product_id
        WHERE c.customer_id = ?
        GROUP BY c.cart_id
    `;

    db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to calculate cart total', details: err });
        console.log(results)
        const totalPrice = results.length > 0 ? results[0].total_price : 0; // Default to 0 if no items in cart
        console.log(totalPrice)
        res.json({ total_price: totalPrice });

    });
});
app.post('/checkout', authenticate, (req, res) => {
    const userId = req.userId; // Extracted from JWT token
    const { payment_method, address, city, postal_code, phone_number } = req.body;

    if (!payment_method || !address || !city || !postal_code || !phone_number) {
        return res.status(400).json({ error: 'All payment and shipment details are required' });
    }

    // Step 1: Calculate Cart Total
    const cartTotalQuery = `
        SELECT SUM(ci.quantity * p.product_price) AS total_price, c.cart_id
        FROM Cart c
        JOIN CartItem ci ON c.cart_id = ci.cart_id
        JOIN Product p ON ci.product_id = p.product_id
        WHERE c.customer_id = ?
    `;

    db.query(cartTotalQuery, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to calculate cart total', details: err });

        const totalPrice = results[0].total_price || 0;
        const cartId = results[0].cart_id;

        if (totalPrice === 0) {
            return res.status(400).json({ error: 'Cart is empty. Cannot proceed to checkout.' });
        }

        // Step 2: Create an Order
        const createOrderQuery = `INSERT INTO Orders (customer_id, total_price) VALUES (?, ?)`;

        db.query(createOrderQuery, [userId, totalPrice], (err, orderResult) => {
            if (err) return res.status(500).json({ error: 'Failed to create order', details: err });

            const orderId = orderResult.insertId;

            // Step 3: Add Payment Record
            const addPaymentQuery = `
                INSERT INTO Payment (order_id, payment_method, payment_amount)
                VALUES (?, ?, ?)
            `;
            db.query(addPaymentQuery, [orderId, payment_method, totalPrice], (err) => {
                if (err) return res.status(500).json({ error: 'Failed to add payment', details: err });

                // Step 4: Add Shipment Record
                const addShipmentQuery = `
                    INSERT INTO Shipment (order_id, address, city, postal_code, phone_number, shipment_date)
                    VALUES (?, ?, ?, ?, ?, NOW())
                `;
                db.query(
                    addShipmentQuery,
                    [orderId, address, city, postal_code, phone_number],
                    (err) => {
                        if (err) return res.status(500).json({ error: 'Failed to add shipment', details: err });

                        // Step 5: Clear the Cart
                        const clearCartQuery = `DELETE FROM CartItem WHERE cart_id = ?`;
                        db.query(clearCartQuery, [cartId], (err) => {
                            if (err) return res.status(500).json({ error: 'Failed to clear cart', details: err });

                            res.json({ message: 'Checkout successful', order_id: orderId });
                        });
                    }
                );
            });
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
