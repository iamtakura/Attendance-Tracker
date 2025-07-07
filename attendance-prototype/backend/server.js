const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Basic route for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Placeholder for API routes (to be expanded later)
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is responding!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
