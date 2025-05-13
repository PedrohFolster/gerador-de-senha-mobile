const express = require('express');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all item routes
router.use('/item', authMiddleware);
router.use('/items', authMiddleware);

// Encryption settings
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'my-secret-key-exactly-32-bytes!!';
const IV_LENGTH = 16; // For AES, this is always 16

// Encrypt function
function encrypt(text) {
  try {
    if (typeof text !== 'string') {
      // If not a string, convert to string
      text = String(text);
    }
    
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error('Encryption error:', error);
    // Return original text if encryption fails
    return text;
  }
}

// Decrypt function
function decrypt(text) {
  try {
    // Check if the text appears to be encrypted (contains a colon)
    if (!text || typeof text !== 'string' || !text.includes(':')) {
      return text; // Return as is if not encrypted
    }
    
    const textParts = text.split(':');
    // Basic validation
    if (textParts.length !== 2) {
      return text; // Not in the expected format
    }
    
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    // If decryption fails, return the original text with a marker
    return `${text} [ENCRYPTED]`;
  }
}

// Create a new password item
router.post('/item', (req, res) => {
  try {
    const { name, password } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!name || !password) {
      return res.status(400).json({ message: 'Name and password are required' });
    }
    
    // Check if item with same name already exists for this user
    global.db.get(
      'SELECT * FROM items WHERE user_id = ? AND name = ?',
      [userId, name],
      (err, item) => {
        if (err) {
          console.error('Database error:', err.message);
          return res.status(500).json({ message: 'Server error' });
        }
        
        if (item) {
          return res.status(400).json({ message: 'Item with this name already exists' });
        }
        
        try {
          // Generate UUID
          const id = uuidv4();
          
          // Encrypt password
          const encryptedPassword = encrypt(password);
          
          // Insert item into database
          global.db.run(
            'INSERT INTO items (id, user_id, name, password) VALUES (?, ?, ?, ?)',
            [id, userId, name, encryptedPassword],
            function(err) {
              if (err) {
                console.error('Insert error:', err.message);
                return res.status(500).json({ message: 'Failed to create item' });
              }
              
              return res.status(201).json({
                id,
                name,
                message: 'Item created successfully'
              });
            }
          );
        } catch (error) {
          console.error('Error encrypting password:', error);
          return res.status(500).json({ message: 'Error encrypting password' });
        }
      }
    );
  } catch (error) {
    console.error('Create item error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get all password items for the authenticated user
router.get('/items', (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all items for the user
    global.db.all(
      'SELECT id, name, password, created_at FROM items WHERE user_id = ? ORDER BY created_at DESC',
      [userId],
      (err, items) => {
        if (err) {
          console.error('Database error:', err.message);
          return res.status(500).json({ message: 'Server error' });
        }
        
        // Decrypt passwords for client
        const decryptedItems = items.map(item => {
          try {
            return {
              ...item,
              password: decrypt(item.password)
            };
          } catch (error) {
            console.error(`Error decrypting password for item ${item.id}:`, error);
            return {
              ...item,
              password: '**DECRYPTION_ERROR**'
            };
          }
        });
        
        return res.json(decryptedItems || []);
      }
    );
  } catch (error) {
    console.error('Get items error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Delete a password item
router.delete('/item/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Delete the item if it belongs to the user
    global.db.run(
      'DELETE FROM items WHERE id = ? AND user_id = ?',
      [id, userId],
      function(err) {
        if (err) {
          console.error('Database error:', err.message);
          return res.status(500).json({ message: 'Server error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ message: 'Item not found' });
        }
        
        return res.json({ message: 'Item deleted successfully' });
      }
    );
  } catch (error) {
    console.error('Delete item error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt; 