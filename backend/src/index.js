const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');

// Configure environment variables
dotenv.config();

// V the app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the SQLite database');
    
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create items table
    db.run(`CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE (user_id, name)
    )`);
  }
});

// Make db available globally
global.db = db;

// Configure CORS
const corsOptions = {
  origin: '*', // Permitir todas as origens durante o desenvolvimento
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Logging middleware para debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Request Body:', req.body);
  next();
});

// Routes
app.use('/api', authRoutes);
app.use('/api', itemRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Password Generator API is running');
});

// Function to encrypt existing unencrypted passwords
const migrateUnencryptedPasswords = () => {
  if (!global.db) return;

  console.log('Checking for unencrypted passwords...');
  
  // Function to check if a string is likely encrypted
  const isLikelyEncrypted = (str) => {
    return str && str.includes(':') && /^[0-9a-f]+:[0-9a-f]+$/.test(str);
  };
  
  // Get all items from database
  global.db.all('SELECT id, password FROM items', [], (err, items) => {
    if (err) {
      console.error('Error checking for unencrypted passwords:', err.message);
      return;
    }
    
    if (!items || items.length === 0) {
      console.log('No password items found to migrate');
      return;
    }
    
    console.log(`Found ${items.length} password items to check`);
    
    // For each item, check if password needs encryption
    items.forEach(item => {
      if (!isLikelyEncrypted(item.password)) {
        console.log(`Encrypting password for item ID: ${item.id}`);
        
        try {
          // Import encrypt function
          const { encrypt } = require('./routes/items');
          
          // Encrypt password and update database
          const encryptedPassword = encrypt(item.password);
          global.db.run(
            'UPDATE items SET password = ? WHERE id = ?',
            [encryptedPassword, item.id],
            (err) => {
              if (err) {
                console.error(`Error encrypting password for item ID ${item.id}:`, err.message);
              } else {
                console.log(`Successfully encrypted password for item ID: ${item.id}`);
              }
            }
          );
        } catch (error) {
          console.error(`Failed to encrypt password for item ID ${item.id}:`, error);
        }
      }
    });
  });
};

// Call migration function after database is initialized and tables are created
// This will help migrate any existing unencrypted passwords
setTimeout(migrateUnencryptedPasswords, 2000);

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server accessible at http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
}); 