const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Questions table
  db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Answers table
  db.run(`
    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      question_id INTEGER,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (question_id) REFERENCES questions (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
}

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// User Registration
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Error creating user' });
        }
        
        const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET);
        res.status(201).json({
          message: 'User created successfully',
          token,
          user: { id: this.lastID, name, email }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      res.json({
        message: 'Login successful',
        token,
        user: { id: user.id, name: user.name, email: user.email }
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
});

// Create Question
app.post('/api/questions', authenticateToken, (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  db.run(
    'INSERT INTO questions (title, description, user_id) VALUES (?, ?, ?)',
    [title, description, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating question' });
      }
      res.status(201).json({
        message: 'Question created successfully',
        questionId: this.lastID
      });
    }
  );
});

// Get All Questions
app.get('/api/questions', (req, res) => {
  db.all(`
    SELECT q.*, u.name as user_name 
    FROM questions q 
    JOIN users u ON q.user_id = u.id 
    ORDER BY q.created_at DESC
  `, (err, questions) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching questions' });
    }
    res.json(questions);
  });
});

// Get Single Question with Answers
app.get('/api/questions/:id', (req, res) => {
  const questionId = req.params.id;

  // Get question details
  db.get(`
    SELECT q.*, u.name as user_name 
    FROM questions q 
    JOIN users u ON q.user_id = u.id 
    WHERE q.id = ?
  `, [questionId], (err, question) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching question' });
    }

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Get answers for this question
    db.all(`
      SELECT a.*, u.name as user_name 
      FROM answers a 
      JOIN users u ON a.user_id = u.id 
      WHERE a.question_id = ? 
      ORDER BY a.created_at ASC
    `, [questionId], (err, answers) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching answers' });
      }

      res.json({
        ...question,
        answers: answers
      });
    });
  });
});

// Create Answer
app.post('/api/questions/:id/answers', authenticateToken, (req, res) => {
  const { content } = req.body;
  const questionId = req.params.id;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  db.run(
    'INSERT INTO answers (content, question_id, user_id) VALUES (?, ?, ?)',
    [content, questionId, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating answer' });
      }
      res.status(201).json({
        message: 'Answer created successfully',
        answerId: this.lastID
      });
    }
  );
});

// Serve static files from React build (for production)
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
