const mysql = require("mysql");

// Use the same DB config as in app.js
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "OnlineShoppingSystem",
});

function connect() {
  return new Promise((resolve, reject) => {
    db.connect((err) => {
      if (err) return reject(err);
      console.log("Connected to database for seeding");
      resolve();
    });
  });
}

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

async function seed() {
  try {
    await connect();

    // --- Migrations: create tables if they do not exist ---
    await query(`
      CREATE TABLE IF NOT EXISTS Category (
        category_id INT AUTO_INCREMENT PRIMARY KEY,
        category_name VARCHAR(255) NOT NULL UNIQUE
      ) ENGINE=InnoDB;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS Supplier (
        supplier_id INT AUTO_INCREMENT PRIMARY KEY,
        supplier_name VARCHAR(255) NOT NULL UNIQUE
      ) ENGINE=InnoDB;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS Customer (
        customer_id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone_number VARCHAR(50),
        address VARCHAR(255),
        city VARCHAR(255),
        postal_code VARCHAR(20)
      ) ENGINE=InnoDB;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS Product (
        product_id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        supplier_id INT NOT NULL,
        product_name VARCHAR(255) NOT NULL UNIQUE,
        product_description TEXT,
        product_price DECIMAL(10,2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        FOREIGN KEY (category_id) REFERENCES Category(category_id),
        FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id)
      ) ENGINE=InnoDB;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS Cart (
        cart_id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
      ) ENGINE=InnoDB;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS CartItem (
        cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
        cart_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        UNIQUE KEY uniq_cart_product (cart_id, product_id),
        FOREIGN KEY (cart_id) REFERENCES Cart(cart_id),
        FOREIGN KEY (product_id) REFERENCES Product(product_id)
      ) ENGINE=InnoDB;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS Wishlist (
        wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        product_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_wishlist_customer_product (customer_id, product_id),
        FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
        FOREIGN KEY (product_id) REFERENCES Product(product_id)
      ) ENGINE=InnoDB;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS Orders (
        order_id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
      ) ENGINE=InnoDB;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS OrderItem (
        order_item_id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES Orders(order_id),
        FOREIGN KEY (product_id) REFERENCES Product(product_id)
      ) ENGINE=InnoDB;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS Payment (
        payment_id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        payment_amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES Orders(order_id)
      ) ENGINE=InnoDB;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS Shipment (
        shipment_id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        address VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        postal_code VARCHAR(20) NOT NULL,
        phone_number VARCHAR(50) NOT NULL,
        shipment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES Orders(order_id)
      ) ENGINE=InnoDB;
    `);

    console.log("Migrations completed (tables ensured)");

    // Seed Category
    const categories = [["Electronics"], ["Clothing"], ["Books"]];

    await query(
      `INSERT INTO Category (category_name) VALUES ? ON DUPLICATE KEY UPDATE category_name = VALUES(category_name)`,
      [categories]
    );
    console.log("Seeded categories");

    // Seed Supplier
    const suppliers = [["Tech World"], ["Fashion Hub"], ["Book Store"]];

    await query(
      `INSERT INTO Supplier (supplier_name) VALUES ? ON DUPLICATE KEY UPDATE supplier_name = VALUES(supplier_name)`,
      [suppliers]
    );
    console.log("Seeded suppliers");

    // Get category and supplier IDs
    const categoryRows = await query("SELECT * FROM Category");
    const supplierRows = await query("SELECT * FROM Supplier");

    const getCategoryId = (name) =>
      categoryRows.find((c) => c.category_name === name)?.category_id;
    const getSupplierId = (name) =>
      supplierRows.find((s) => s.supplier_name === name)?.supplier_id;

    // Seed Product
    const products = [
      {
        category: "Electronics",
        supplier: "Tech World",
        name: "Smartphone X",
        description: "Latest smartphone with great features",
        price: 699.99,
        stock: 50,
      },
      {
        category: "Electronics",
        supplier: "Tech World",
        name: "Laptop Pro",
        description: "High performance laptop",
        price: 1299.99,
        stock: 30,
      },
      {
        category: "Clothing",
        supplier: "Fashion Hub",
        name: "Casual T-Shirt",
        description: "Comfortable cotton t-shirt",
        price: 19.99,
        stock: 100,
      },
      {
        category: "Books",
        supplier: "Book Store",
        name: "JavaScript Guide",
        description: "Learn JavaScript from scratch",
        price: 39.99,
        stock: 40,
      },
    ];

    for (const p of products) {
      const categoryId = getCategoryId(p.category);
      const supplierId = getSupplierId(p.supplier);

      if (!categoryId || !supplierId) continue;

      await query(
        `INSERT INTO Product (category_id, supplier_id, product_name, product_description, product_price, stock)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE product_description = VALUES(product_description), product_price = VALUES(product_price), stock = VALUES(stock)`,
        [categoryId, supplierId, p.name, p.description, p.price, p.stock]
      );
    }
    console.log("Seeded products");

    // Seed a demo customer for login/testing
    const demoCustomer = {
      first_name: "Demo",
      last_name: "User",
      email: "demo@example.com",
      password: "password123", // plain here to match current login logic
      phone_number: "1234567890",
      address: "123 Demo Street",
      city: "Demo City",
      postal_code: "12345",
    };

    await query(
      `INSERT INTO Customer (first_name, last_name, email, password, phone_number, address, city, postal_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), password = VALUES(password), phone_number = VALUES(phone_number), address = VALUES(address), city = VALUES(city), postal_code = VALUES(postal_code)`,
      [
        demoCustomer.first_name,
        demoCustomer.last_name,
        demoCustomer.email,
        demoCustomer.password,
        demoCustomer.phone_number,
        demoCustomer.address,
        demoCustomer.city,
        demoCustomer.postal_code,
      ]
    );
    console.log(
      "Seeded demo customer (email: demo@example.com, password: password123)"
    );

    console.log("Seeding completed successfully");
  } catch (err) {
    console.error("Error during seeding:", err);
  } finally {
    db.end();
  }
}

seed();
