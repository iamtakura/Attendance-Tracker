const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(__dirname)); // Serve static files
app.use(express.json()); // Parse JSON bodies

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint for student signup
app.post('/api/signup', async (req, res) => {
    try {
        const { fullName, year, program, username, password } = req.body;

        // Basic validation
        if (!fullName || !year || !program || !username || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const csvRow = `\n${fullName},${year},${program},${username},${hashedPassword}`;
        const csvFilePath = path.join(__dirname, 'students.csv');

        // Append data to CSV file
        fs.appendFile(csvFilePath, csvRow, (err) => {
            if (err) {
                console.error('Error writing to CSV file:', err);
                return res.status(500).json({ message: 'Failed to save student data.' });
            }
            console.log(`New student signed up: ${username}`);
            res.status(201).json({ message: 'Signup successful!' });
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'An error occurred during signup.' });
    }
});

// Placeholder for API routes
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is responding!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
