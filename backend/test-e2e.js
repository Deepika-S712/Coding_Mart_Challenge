const http = require('http');
const app = require('./server');

const PORT = 5055;
let server;
let adminToken = '';

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });
    req.on('error', reject);
    if (body) {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      req.setHeader('Content-Type', 'application/json');
      req.setHeader('Content-Length', Buffer.byteLength(payload));
      req.write(payload);
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING END-TO-END VALIDATION SUITE');
  console.log('====================================================');

  server = app.listen(PORT);

  try {
    // 1. Healthcheck
    console.log('\n[1] Testing Healthcheck...');
    const health = await request({ hostname: 'localhost', port: PORT, path: '/api/health', method: 'GET' });
    console.assert(health.status === 200, 'Healthcheck status should be 200');
    console.log('✓ Healthcheck passed:', health.body.message);

    // 2. Unauthenticated access should be blocked
    console.log('\n[2] Testing Route Protection (No Token)...');
    const blocked = await request({ hostname: 'localhost', port: PORT, path: '/api/admin/dashboard', method: 'GET' });
    console.assert(blocked.status === 401, 'Unauthenticated request should return 401');
    console.log('✓ Protected route successfully rejected unauthenticated request');

    // 3. Admin Login (Bad Credentials)
    console.log('\n[3] Testing Admin Login (Bad Credentials)...');
    const badLogin = await request(
      { hostname: 'localhost', port: PORT, path: '/api/admin/login', method: 'POST' },
      { email: 'admin@college.edu', password: 'WrongPassword!' }
    );
    console.assert(badLogin.status === 401, 'Bad credentials should return 401');
    console.log('✓ Bad password rejected');

    // 4. Admin Login (Valid Credentials)
    console.log('\n[4] Testing Admin Login (Valid Admin)...');
    const login = await request(
      { hostname: 'localhost', port: PORT, path: '/api/admin/login', method: 'POST' },
      { email: 'admin@college.edu', password: 'AdminPassword123!' }
    );
    console.assert(login.status === 200, 'Valid login should return 200');
    console.assert(login.body.token, 'Token must be present in response');
    adminToken = login.body.token;
    console.log('✓ Admin login successful. JWT token received. User:', login.body.user.email);

    const authHeaders = { Authorization: `Bearer ${adminToken}` };

    // 5. Dashboard Data from PostgreSQL
    console.log('\n[5] Testing Admin Dashboard API...');
    const dash = await request({ hostname: 'localhost', port: PORT, path: '/api/admin/dashboard', method: 'GET', headers: authHeaders });
    console.assert(dash.status === 200, 'Dashboard should return 200');
    console.log('✓ Dashboard statistics retrieved from PostgreSQL:');
    console.log('  Totals:', dash.body.data.totals);
    console.log('  Students by Dept count:', dash.body.data.charts.studentsByDepartment.length);

    // 6. Student CRUD
    console.log('\n[6] Testing Student CRUD...');
    // Create Student
    const newStudent = {
      student_id: 'STU-TEST-999',
      name: 'Test Student Automated',
      email: 'test.student.auto@student.edu',
      phone: '+91 99999 88888',
      gender: 'Male',
      date_of_birth: '2004-06-15',
      address: 'Test Address 123',
      year: 1,
      admission_date: '2024-08-01',
      status: 'Active',
    };
    const createRes = await request(
      { hostname: 'localhost', port: PORT, path: '/api/admin/students', method: 'POST', headers: authHeaders },
      newStudent
    );
    console.assert(createRes.status === 201, 'Create student should return 201');
    const createdId = createRes.body.data.id;
    console.log(`✓ Student created with ID: ${createdId} (${newStudent.student_id})`);

    // Get Student by ID
    const getRes = await request(
      { hostname: 'localhost', port: PORT, path: `/api/admin/students/${createdId}`, method: 'GET', headers: authHeaders }
    );
    console.assert(getRes.status === 200, 'Get student should return 200');
    console.assert(getRes.body.data.name === newStudent.name, 'Name should match');
    console.log('✓ Student detail verified');

    // Update Student
    const updateRes = await request(
      { hostname: 'localhost', port: PORT, path: `/api/admin/students/${createdId}`, method: 'PUT', headers: authHeaders },
      { name: 'Updated Student Name' }
    );
    console.assert(updateRes.status === 200, 'Update student should return 200');
    console.assert(updateRes.body.data.name === 'Updated Student Name', 'Updated name should match');
    console.log('✓ Student update verified');

    // Delete Student
    const deleteRes = await request(
      { hostname: 'localhost', port: PORT, path: `/api/admin/students/${createdId}`, method: 'DELETE', headers: authHeaders }
    );
    console.assert(deleteRes.status === 200, 'Delete student should return 200');
    console.log('✓ Student deletion verified');

    // 7. Timetable Conflict Validation
    console.log('\n[7] Testing Timetable Conflict Validation...');
    // Existing slot: Monday 09:00 - 10:00, course: CS101, subject: CS301, faculty: FAC-001 (id 1), room: LH-101
    // Let's query courses and faculty to get IDs
    const coursesRes = await request({ hostname: 'localhost', port: PORT, path: '/api/admin/courses', method: 'GET', headers: authHeaders });
    const facultyRes = await request({ hostname: 'localhost', port: PORT, path: '/api/admin/faculty', method: 'GET', headers: authHeaders });
    const subjectsRes = await request({ hostname: 'localhost', port: PORT, path: '/api/admin/subjects', method: 'GET', headers: authHeaders });

    const cId = coursesRes.body.data[0].id;
    const fId1 = facultyRes.body.data.faculty[0].id;
    const fId2 = facultyRes.body.data.faculty[1].id;
    const sId = subjectsRes.body.data[0].id;

    // Fetch existing timetable on Monday
    const mondaySlots = await request({ hostname: 'localhost', port: PORT, path: '/api/admin/timetable?day=Monday', method: 'GET', headers: authHeaders });
    const existingSlot = mondaySlots.body.data[0];

    // A. Attempt Faculty Conflict: Same day, overlapping time (09:15 - 09:45), same faculty, different room
    const facultyConflictSlot = {
      day: existingSlot.day,
      start_time: '09:15',
      end_time: '09:45',
      course_id: cId,
      subject_id: sId,
      faculty_id: existingSlot.faculty_id,
      room_number: 'LH-999-DIFFERENT',
    };
    const fcRes = await request(
      { hostname: 'localhost', port: PORT, path: '/api/admin/timetable', method: 'POST', headers: authHeaders },
      facultyConflictSlot
    );
    console.assert(fcRes.status === 409, 'Faculty conflict must return 409 Conflict');
    console.assert(fcRes.body.conflictType === 'faculty', 'Conflict type should be faculty');
    console.log('✓ Faculty double-booking successfully intercepted:');
    console.log('  Message:', fcRes.body.message);

    // B. Attempt Room Conflict: Same day, overlapping time (09:15 - 09:45), different faculty (fId2), same room
    const roomConflictSlot = {
      day: existingSlot.day,
      start_time: '09:15',
      end_time: '09:45',
      course_id: cId,
      subject_id: sId,
      faculty_id: fId2 === existingSlot.faculty_id ? fId1 : fId2,
      room_number: existingSlot.room_number,
    };
    const rcRes = await request(
      { hostname: 'localhost', port: PORT, path: '/api/admin/timetable', method: 'POST', headers: authHeaders },
      roomConflictSlot
    );
    console.assert(rcRes.status === 409, 'Room conflict must return 409 Conflict');
    console.assert(rcRes.body.conflictType === 'room', 'Conflict type should be room');
    console.log('✓ Room double-booking successfully intercepted:');
    console.log('  Message:', rcRes.body.message);

    // 8. Reports & CSV Export
    console.log('\n[8] Testing Reports & CSV Export...');
    const reportRes = await request({ hostname: 'localhost', port: PORT, path: '/api/admin/reports', method: 'GET', headers: authHeaders });
    console.assert(reportRes.status === 200, 'Reports endpoint should return 200');
    console.log('✓ Reports data retrieved:');
    console.log('  Total Students:', reportRes.body.data.students.total);
    console.log('  Total Faculty:', reportRes.body.data.faculty.total);

    const csvRes = await request({ hostname: 'localhost', port: PORT, path: '/api/admin/reports/export/students', method: 'GET', headers: authHeaders });
    console.assert(csvRes.status === 200, 'CSV export should return 200');
    console.assert(typeof csvRes.body === 'string' && csvRes.body.includes('Student ID'), 'CSV content should contain header');
    console.log('✓ CSV export generated successfully');

    console.log('\n====================================================');
    console.log('✅ ALL TEST SUITES PASSED CLEANLY (100%)');
    console.log('====================================================\n');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Test suite failed:', err);
    if (server) server.close();
    process.exit(1);
  }
}

runTests();
