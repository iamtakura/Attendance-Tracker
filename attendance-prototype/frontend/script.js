// JavaScript for frontend interactions with backend API

document.addEventListener('DOMContentLoaded', () => {
    console.log('Attendance Tracker script loaded.');

    // --- Global State (for prototype) ---
    let currentUser = null; // Store logged-in user info

    // --- API Configuration ---
    const API_URL = 'http://localhost:3000/api';

    // --- Helper for API calls ---
    async function apiRequest(endpoint, method = 'GET', body = null) {
        try {
            const options = {
                method,
                headers: { 'Content-Type': 'application/json' },
            };
            if (body) {
                options.body = JSON.stringify(body);
            }
            const response = await fetch(`${API_URL}${endpoint}`, options);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error(`API request failed: ${method} ${endpoint}`, error);
            alert(`Error: ${error.message}`);
            return null;
        }
    }

    // --- Student Portal Logic (index.html) ---
    const studentLoginForm = document.getElementById('student-login-form');
    const studentDashboard = document.getElementById('student-dashboard');
    const studentLoginSection = document.getElementById('login-section');
    const studentNameSpan = document.getElementById('student-name');
    const attendanceRecordDiv = document.getElementById('attendance-record');
    const reportAbsenceForm = document.getElementById('report-absence-form');

    if (studentLoginForm) {
        studentLoginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = event.target.username.value;
            // In a real app, you'd post the username and password for verification.
            // For this prototype, we'll fetch all users and find the one that matches.
            const users = await apiRequest('/users');
            if (users) {
                const user = users.find(u => u.username === username && u.role === 'student');
                if (user) {
                    currentUser = user;
                    if (studentLoginSection) studentLoginSection.style.display = 'none';
                    if (studentDashboard) studentDashboard.style.display = 'block';
                    if (studentNameSpan) studentNameSpan.textContent = currentUser.name;
                    loadStudentAttendance(currentUser.id);
                } else {
                    alert('Student not found.');
                }
            }
        });
    }

    if (reportAbsenceForm) {
        reportAbsenceForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!currentUser) {
                alert('You must be logged in to report an absence.');
                return;
            }
            const date = event.target['absence-date'].value;
            const reason = event.target['absence-reason'].value;
            // For simplicity, we'll just assign it to the first course. A real app would have a course selector.
            const courseId = 'C101';
            const result = await apiRequest('/absence', 'POST', { studentId: currentUser.id, courseId, date, reason });
            if (result) {
                alert('Absence reported successfully!');
                event.target.reset();
                loadStudentAttendance(currentUser.id); // Refresh attendance
            }
        });
    }

    async function loadStudentAttendance(studentId) {
        const records = await apiRequest(`/attendance/${studentId}`);
        if (records) {
            if (attendanceRecordDiv) {
                if (records.length === 0) {
                    attendanceRecordDiv.innerHTML = '<p>No attendance records found.</p>';
                    return;
                }
                const tableRows = records.map(rec => `
                    <tr>
                        <td>${rec.courseName}</td>
                        <td>${rec.date}</td>
                        <td>${rec.status}</td>
                    </tr>
                `).join('');
                attendanceRecordDiv.innerHTML = `
                    <table>
                        <thead>
                            <tr><th>Course</th><th>Date</th><th>Status</th></tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                `;
            }
        }
    }

    // --- Admin Portal Logic (admin.html) ---
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminDashboard = document.getElementById('admin-dashboard');
    const adminLoginSection = document.getElementById('admin-login-section');
    const adminNameSpan = document.getElementById('admin-name');
    const markAttendanceForm = document.getElementById('mark-attendance-form');
    const selectStudentDropdown = document.getElementById('select-student');
    const studentAttendanceDetailsDiv = document.getElementById('student-attendance-details');

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = event.target.username.value;
            const users = await apiRequest('/users');
            if (users) {
                const user = users.find(u => u.username === username && u.role === 'admin');
                if (user) {
                    currentUser = user;
                    if (adminLoginSection) adminLoginSection.style.display = 'none';
                    if (adminDashboard) adminDashboard.style.display = 'block';
                    if (adminNameSpan) adminNameSpan.textContent = currentUser.name;
                    loadStudentsForAdmin();
                } else {
                    alert('Administrator not found.');
                }
            }
        });
    }

    async function loadStudentsForAdmin() {
        const users = await apiRequest('/users');
        if (users && selectStudentDropdown) {
            const students = users.filter(u => u.role === 'student');
            // Clear existing options except the first one
            while (selectStudentDropdown.options.length > 1) {
                selectStudentDropdown.remove(1);
            }
            students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.id;
                option.textContent = `${student.name} (${student.id})`;
                selectStudentDropdown.appendChild(option);
            });
        }
    }

    if (selectStudentDropdown) {
        selectStudentDropdown.addEventListener('change', async (event) => {
            const selectedStudentId = event.target.value;
            if (selectedStudentId) {
                const records = await apiRequest(`/attendance/${selectedStudentId}`);
                if (records && studentAttendanceDetailsDiv) {
                     if (records.length === 0) {
                        studentAttendanceDetailsDiv.innerHTML = '<p>No attendance records found for this student.</p>';
                        return;
                    }
                    const tableRows = records.map(rec => `
                        <tr>
                            <td>${rec.courseName}</td>
                            <td>${rec.date}</td>
                            <td>${rec.status}</td>
                        </tr>
                    `).join('');
                    studentAttendanceDetailsDiv.innerHTML = `
                        <h4>Attendance for ${selectStudentDropdown.options[selectStudentDropdown.selectedIndex].text}</h4>
                        <table>
                            <thead>
                                <tr><th>Course</th><th>Date</th><th>Status</th></tr>
                            </thead>
                            <tbody>${tableRows}</tbody>
                        </table>
                    `;
                }
            } else {
                if (studentAttendanceDetailsDiv) studentAttendanceDetailsDiv.innerHTML = '<p>Select a student to view their attendance.</p>';
            }
        });
    }

    if (markAttendanceForm) {
        markAttendanceForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const studentId = event.target['student-id'].value;
            const date = event.target.date.value;
            const status = event.target.status.value;
            // For simplicity, assign to first course. Real app would have course selector.
            const courseId = 'C101';
            const result = await apiRequest('/mark', 'POST', { studentId, courseId, date, status });
            if (result) {
                alert('Attendance marked successfully!');
                event.target.reset();
                // If this student is currently selected, refresh their view
                if (selectStudentDropdown && selectStudentDropdown.value === studentId) {
                    selectStudentDropdown.dispatchEvent(new Event('change'));
                }
            }
        });
    }
});
