const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;


app.use(cors());
app.use(bodyParser.json());


const MONGO_URI = 'mongodb://localhost:27017/todoapp';
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// JWT Secret Key
const JWT_SECRET = 'your_123abc_secret_key';

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Todo Schema
const todoSchema = new mongoose.Schema({
  task: { type: String, required: true },
  completed: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Todo = mongoose.model('Todo', todoSchema);

// Helper: Middleware to verify JWT
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ error: 'Access Denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Routes

// User Registration
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    res.status(400).json({ error: 'Error registering user or email already exists.' });
  }
});

// User Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password.' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Error logging in user.' });
  }
});


app.get('/todos', authenticate, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user.id });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching todos' });
  }
});

app.post('/todos', authenticate, async (req, res) => {
  const { task } = req.body;
  if (!task) {
    return res.status(400).json({ error: 'Task is required' });
  }

  try {
    const newTodo = new Todo({ task, userId: req.user.id });
    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (err) {
    res.status(500).json({ error: 'Error saving the todo' });
  }
});


app.put('/todos/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { task, completed } = req.body;

  try {
    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { task, completed },
      { new: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ error: 'Error updating the todo' });
  }
});


app.delete('/todos/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTodo = await Todo.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deletedTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(deletedTodo);
  } catch (err) {
    res.status(500).json({ error: 'Error deleting the todo' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
