const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const dealRoutes = require('./routes/dealRoutes');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch(err => {
  console.error('❌ MongoDB connection failed:', err);
});

// Sample API route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Add this middleware before serving frontend
app.use('/api/auth', authRoutes);


// deal routes
app.use('/api/deals', dealRoutes);

// Serve React build
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
