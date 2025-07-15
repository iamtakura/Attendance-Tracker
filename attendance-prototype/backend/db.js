const { join, dirname } = require('path');
const { fileURLToPath } = require('url');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const { nanoid } = require('nanoid');

// Since we are using CommonJS, we can't use import.meta.url.
// We'll use __dirname which is available in CommonJS modules.
const file = join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

// Read data from JSON file, initializing with defaults if empty
async function initializeDatabase() {
    await db.read();
    db.data = db.data || {
        users: [],
        courses: [],
        attendance: []
    };
    await db.write();

    // Seed database if it's empty
    if (db.data.users.length === 0) {
        await seedDatabase();
    }
}

// Seed the database with some initial data
async function seedDatabase() {
    console.log('Seeding database...');
    const student1Id = nanoid(5);
    const student2Id = nanoid(5);
    const adminId = nanoid(5);

    const seedUsers = [
        { id: student1Id, username: 'student1', password: 'password1', role: 'student', name: 'Alice Smith' },
        { id: student2Id, username: 'student2', password: 'password2', role: 'student', name: 'Bob Johnson' },
        { id: adminId, username: 'admin1', password: 'adminpass', role: 'admin', name: 'Dr. Eleanor Vance' }
    ];
    const seedCourses = [
        { id: 'C101', name: 'Math 101' },
        { id: 'C202', name: 'History 202' }
    ];
    const seedAttendance = [
        { id: nanoid(), studentId: student1Id, courseId: 'C101', date: '2023-10-25', status: 'present' },
        { id: nanoid(), studentId: student1Id, courseId: 'C202', date: '2023-10-26', status: 'absent' },
        { id: nanoid(), studentId: student2Id, courseId: 'C101', date: '2023-10-25', status: 'present' },
        { id: nanoid(), studentId: student2Id, courseId: 'C202', date: '2023-10-26', status: 'present' },
    ];

    db.data.users.push(...seedUsers);
    db.data.courses.push(...seedCourses);
    db.data.attendance.push(...seedAttendance);

    await db.write();
    console.log('Database seeded.');
}

// Export a function that returns the initialized db instance
module.exports = async () => {
    await initializeDatabase();
    console.log('Database initialized successfully.');
    return db;
};
