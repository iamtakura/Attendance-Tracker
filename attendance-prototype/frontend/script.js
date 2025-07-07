// Basic JavaScript for frontend interactions (prototype)

document.addEventListener('DOMContentLoaded', () => {
    console.log('Attendance Tracker script loaded.');

    // --- Common Elements ---
    // (Could be separated into student_script.js and admin_script.js later)

    // --- Student Portal Logic (index.html) ---
    const studentLoginForm = document.getElementById('student-login-form');
    const studentDashboard = document.getElementById('student-dashboard');
    const studentLoginSection = document.getElementById('login-section'); // Assuming student login is in 'login-section'
    const studentNameSpan = document.getElementById('student-name');
    const attendanceRecordDiv = document.getElementById('attendance-record');
    const reportAbsenceForm = document.getElementById('report-absence-form');

    if (studentLoginForm) {
        studentLoginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = event.target.username.value;
            // const password = event.target.password.value; // Password would be sent in a real app
            console.log(`Student login attempt: ${username}`);
            // In a real app, you'd fetch('/api/auth/student/login', { method: 'POST', ... })
            // For prototype, simulate login
            if (username) { // Basic check
                if (studentLoginSection) studentLoginSection.style.display = 'none';
                if (studentDashboard) studentDashboard.style.display = 'block';
                if (studentNameSpan) studentNameSpan.textContent = username;
                loadStudentAttendance(username); // Simulate loading data
            } else {
                alert('Please enter a username.');
            }
        });
    }

    if (reportAbsenceForm) {
        reportAbsenceForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const date = event.target['absence-date'].value;
            const reason = event.target['absence-reason'].value;
            console.log(`Absence reported for ${date}, Reason: ${reason}`);
            // In a real app, fetch('/api/student/report-absence', { method: 'POST', ... })
            alert('Absence reported (simulated).');
            event.target.reset();
        });
    }

    function loadStudentAttendance(studentUsername) {
        console.log(`Loading attendance for ${studentUsername}...`);
        // Simulate API call
        setTimeout(() => {
            if (attendanceRecordDiv) {
                attendanceRecordDiv.innerHTML = `
                    <table>
                        <thead>
                            <tr><th>Course</th><th>Date</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Math 101</td><td>2023-10-25</td><td>Present</td></tr>
                            <tr><td>History 202</td><td>2023-10-26</td><td>Absent</td></tr>
                            <tr><td>Science 101</td><td>2023-10-27</td><td>Present</td></tr>
                        </tbody>
                    </table>
                `;
            }
        }, 500);
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
            console.log(`Admin login attempt: ${username}`);
            // In a real app, fetch('/api/auth/admin/login', { method: 'POST', ... })
            if (username) {
                if (adminLoginSection) adminLoginSection.style.display = 'none';
                if (adminDashboard) adminDashboard.style.display = 'block';
                if (adminNameSpan) adminNameSpan.textContent = username;
                loadStudentsForAdmin(); // Simulate
            } else {
                alert('Please enter a username.');
            }
        });
    }

    if (markAttendanceForm) {
        markAttendanceForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const studentId = event.target['student-id'].value;
            const date = event.target.date.value;
            const status = event.target.status.value;
            console.log(`Marking attendance for student ${studentId} on ${date} as ${status}`);
            // In a real app, fetch('/api/admin/mark-attendance', { method: 'POST', ... })
            alert('Attendance marked (simulated).');
            event.target.reset();
        });
    }

    if (selectStudentDropdown) {
        selectStudentDropdown.addEventListener('change', (event) => {
            const selectedStudentId = event.target.value;
            if (selectedStudentId) {
                console.log(`Admin selected student ID: ${selectedStudentId}`);
                loadSpecificStudentAttendanceDetails(selectedStudentId);
            } else {
                if(studentAttendanceDetailsDiv) studentAttendanceDetailsDiv.innerHTML = '<p>Select a student to view their attendance.</p>';
            }
        });
    }

    function loadStudentsForAdmin() {
        // Simulate fetching student list
        console.log("Loading students for admin dropdown...");
        setTimeout(() => {
            if (selectStudentDropdown) {
                // Clear existing options except the first one
                while (selectStudentDropdown.options.length > 1) {
                    selectStudentDropdown.remove(1);
                }
                const students = [{id: 's101', name: 'Alice Smith'}, {id: 's102', name: 'Bob Johnson'}];
                students.forEach(student => {
                    const option = document.createElement('option');
                    option.value = student.id;
                    option.textContent = `${student.name} (${student.id})`;
                    selectStudentDropdown.appendChild(option);
                });
            }
        }, 300);
    }

    function loadSpecificStudentAttendanceDetails(studentId) {
        console.log(`Loading attendance details for student ${studentId}...`);
        // Simulate API call
        setTimeout(() => {
            if (studentAttendanceDetailsDiv) {
                studentAttendanceDetailsDiv.innerHTML = `
                    <h4>Attendance for Student ${studentId}</h4>
                    <table>
                        <thead>
                            <tr><th>Course</th><th>Date</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Math 101</td><td>2023-10-25</td><td>Present</td></tr>
                            <tr><td>History 202</td><td>2023-10-26</td><td>${studentId === 's101' ? 'Present' : 'Absent'}</td></tr>
                        </tbody>
                    </table>
                `;
            }
        }, 500);
    }

    // Test API call to backend (if backend is running and configured)
    // Can be triggered from a button or automatically
    async function testBackendApi() {
        try {
            const response = await fetch('/api/test');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Backend API Test successful:', data);
            // You could display this message on the page if needed
            // alert(`Backend says: ${data.message}`);
        } catch (error) {
            console.error('Backend API Test failed:', error);
            // alert('Failed to connect to backend. Is it running?');
        }
    }

    // Call the test function once the page is loaded (optional)
    // testBackendApi();
});
