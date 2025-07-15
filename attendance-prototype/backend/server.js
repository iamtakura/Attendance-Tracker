const express = require('express');
const path = require('path');
const cors = require('cors');
const { nanoid } = require('nanoid');
const initializeDb = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON bodies
app.use(express.static(path.join(__dirname, '../frontend'))); // Serve static files

// Main function to setup routes and start server
async function main() {
    // Initialize the database and get the db instance
    const db = await initializeDb();

    // --- API Routes ---

    // GET all users (useful for admin dropdown)
    app.get('/api/users', (req, res) => {
        const users = db.data.users;
        res.json(users);
    });

    // GET attendance for a specific student
    app.get('/api/attendance/:studentId', (req, res) => {
        const { studentId } = req.params;
        const attendanceRecords = db.data.attendance.filter(
            (record) => record.studentId === studentId
        );

        // For more detail, we can join with course data
        const detailedRecords = attendanceRecords.map(record => {
            const course = db.data.courses.find(c => c.id === record.courseId);
            return {
                ...record,
                courseName: course ? course.name : 'Unknown Course'
            };
        });

        res.json(detailedRecords);
    });

    // POST to report an absence
    app.post('/api/absence', (req, res) => {
        const { studentId, courseId, date, reason } = req.body;
        // Basic validation
        if (!studentId || !courseId || !date) {
            return res.status(400).json({ message: 'Missing required fields: studentId, courseId, date' });
        }

        const newAbsence = {
            id: nanoid(),
            studentId,
            courseId,
            date,
            status: 'excused', // Reported absences are marked as excused
            reason: reason || ''
        };

        db.data.attendance.push(newAbsence);
        db.write(); // Asynchronously write to db.json

        res.status(201).json({ message: 'Absence reported successfully', data: newAbsence });
    });

    // POST to mark attendance (for admin)
    app.post('/api/mark', (req, res) => {
        const { studentId, courseId, date, status } = req.body;
        if (!studentId || !courseId || !date || !status) {
            return res.status(400).json({ message: 'Missing required fields: studentId, courseId, date, status' });
        }

        const newRecord = {
            id: nanoid(),
            studentId,
            courseId,
            date,
            status
        };

        db.data.attendance.push(newRecord);
        db.write();

        res.status(201).json({ message: 'Attendance marked successfully', data: newRecord });
    });


    // --- Frontend Routes ---

    // Serve the student portal
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    });

    // Serve the admin portal
    app.get('/admin', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/admin.html'));
    });


    // Start the server
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

// Run the main function and catch any errors
main().catch(err => {
    console.error('Failed to start server:', err);
});
