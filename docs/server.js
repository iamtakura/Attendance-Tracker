const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(__dirname)); // Serve static files
app.use(express.json()); // Parse JSON bodies

const csvFilePath = path.join(__dirname, 'students.csv');
const csvHeader = 'fullName,year,program,username,password\n';

async function initializeCsv() {
    try {
        await fs.access(csvFilePath);
    } catch (error) {
        if (error.code === 'ENOENT') {
            try {
                await fs.writeFile(csvFilePath, csvHeader);
                console.log('students.csv created with header.');
            } catch (writeError) {
                console.error('Error creating students.csv:', writeError);
                process.exit(1);
            }
        } else {
            console.error('Error accessing students.csv:', error);
            process.exit(1);
        }
    }
}

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

        // Use Node.js's built-in crypto module for a simple hash
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        const csvRow = `${fullName},${year},${program},${username},${hashedPassword}\n`;

        // Append data to CSV file using promises for better error handling
        await fs.appendFile(csvFilePath, csvRow);

        console.log(`New student signed up: ${username}`);
        res.status(201).json({ message: 'Signup successful!' });
    } catch (error) {
        console.error('Signup error:', error);
        // Send a more specific error message back to the client
        res.status(500).json({ message: 'An error occurred during signup.', error: error.message });
    }
});

// Placeholder for API routes
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is responding!' });
});

initializeCsv().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(error => {
    console.error("Failed to initialize and start server:", error);
    process.exit(1);
});