const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seed() {
  console.log('--- Starting College Management Database Seeding ---');

  try {
    // 1. Create or Update Default Admin
    const adminPassword = 'AdminPassword123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const adminCheck = await db.query('SELECT * FROM users WHERE email = $1', ['admin@college.edu']);
    if (adminCheck.rows.length === 0) {
      await db.query(
        `INSERT INTO users (name, email, password, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        ['System Administrator', 'admin@college.edu', hashedPassword, 'ADMIN']
      );
      console.log('✓ Default Admin account created: admin@college.edu / AdminPassword123!');
    } else {
      await db.query(
        `UPDATE users SET password = $1, updated_at = NOW() WHERE email = $2`,
        [hashedPassword, 'admin@college.edu']
      );
      console.log('✓ Admin account updated: admin@college.edu / AdminPassword123!');
    }

    // 2. Insert Departments
    const departments = [
      { name: 'Computer Science & Engineering', code: 'CSE', hod: 'Dr. Arvind Sharma', desc: 'Department of Computer Science and Engineering focusing on computing, algorithms, and software.' },
      { name: 'Information Technology', code: 'IT', hod: 'Dr. Priya Nair', desc: 'Department of Information Technology focusing on enterprise software, networking, and security.' },
      { name: 'Electronics & Communication', code: 'ECE', hod: 'Dr. Rajesh Gupta', desc: 'Department of ECE focusing on embedded systems, signal processing, and communication.' },
      { name: 'Mechanical Engineering', code: 'ME', hod: 'Dr. Suresh Verma', desc: 'Department of Mechanical Engineering focusing on thermal dynamics, robotics, and design.' },
      { name: 'Business Administration', code: 'MBA', hod: 'Dr. Meenakshi Sundaram', desc: 'Department of Management and Business Studies.' }
    ];

    const deptMap = {};
    for (const d of departments) {
      const res = await db.query(
        `INSERT INTO departments (department_name, department_code, hod_name, description, status)
         VALUES ($1, $2, $3, $4, 'Active')
         ON CONFLICT (department_code) DO UPDATE
         SET department_name = EXCLUDED.department_name, hod_name = EXCLUDED.hod_name, description = EXCLUDED.description
         RETURNING id, department_code`,
        [d.name, d.code, d.hod, d.desc]
      );
      deptMap[d.code] = res.rows[0].id;
    }
    console.log(`✓ Inserted/Updated ${departments.length} departments`);

    // 3. Insert Courses
    const courses = [
      { name: 'B.Tech Computer Science', code: 'CS101', dept: deptMap['CSE'], duration: '4 Years', degree: 'Undergraduate', desc: 'Bachelor of Technology in Computer Science & Engineering.' },
      { name: 'B.Tech Information Technology', code: 'IT101', dept: deptMap['IT'], duration: '4 Years', degree: 'Undergraduate', desc: 'Bachelor of Technology in Information Technology.' },
      { name: 'B.Tech Electronics & Communication', code: 'EC101', dept: deptMap['ECE'], duration: '4 Years', degree: 'Undergraduate', desc: 'Bachelor of Technology in Electronics and Communication.' },
      { name: 'B.Tech Mechanical Engineering', code: 'ME101', dept: deptMap['ME'], duration: '4 Years', degree: 'Undergraduate', desc: 'Bachelor of Technology in Mechanical Engineering.' },
      { name: 'Master of Business Administration', code: 'MBA101', dept: deptMap['MBA'], duration: '2 Years', degree: 'Postgraduate', desc: 'Master in Business Administration.' },
      { name: 'Bachelor of Business Administration', code: 'BBA101', dept: deptMap['MBA'], duration: '3 Years', degree: 'Undergraduate', desc: 'Bachelor in Business Administration.' }
    ];

    const courseMap = {};
    for (const c of courses) {
      const res = await db.query(
        `INSERT INTO courses (course_name, course_code, department_id, duration, degree_type, description, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'Active')
         ON CONFLICT (course_code) DO UPDATE
         SET course_name = EXCLUDED.course_name, department_id = EXCLUDED.department_id, duration = EXCLUDED.duration, degree_type = EXCLUDED.degree_type
         RETURNING id, course_code`,
        [c.name, c.code, c.dept, c.duration, c.degree, c.desc]
      );
      courseMap[c.code] = res.rows[0].id;
    }
    console.log(`✓ Inserted/Updated ${courses.length} courses`);

    // 4. Insert Faculty
    const faculties = [
      { fid: 'FAC-001', name: 'Dr. Arvind Sharma', email: 'arvind.sharma@college.edu', phone: '+91 98765 43210', gender: 'Male', dept: deptMap['CSE'], desig: 'Professor', joining: '2018-06-15' },
      { fid: 'FAC-002', name: 'Prof. Ananya Roy', email: 'ananya.roy@college.edu', phone: '+91 98765 43211', gender: 'Female', dept: deptMap['CSE'], desig: 'Associate Professor', joining: '2020-01-10' },
      { fid: 'FAC-003', name: 'Dr. Priya Nair', email: 'priya.nair@college.edu', phone: '+91 98765 43212', gender: 'Female', dept: deptMap['IT'], desig: 'Professor', joining: '2019-07-01' },
      { fid: 'FAC-004', name: 'Prof. Rohan Kulkarni', email: 'rohan.kulkarni@college.edu', phone: '+91 98765 43213', gender: 'Male', dept: deptMap['IT'], desig: 'Assistant Professor', joining: '2021-08-15' },
      { fid: 'FAC-005', name: 'Dr. Rajesh Gupta', email: 'rajesh.gupta@college.edu', phone: '+91 98765 43214', gender: 'Male', dept: deptMap['ECE'], desig: 'Professor', joining: '2017-09-01' },
      { fid: 'FAC-006', name: 'Prof. Sunita Rao', email: 'sunita.rao@college.edu', phone: '+91 98765 43215', gender: 'Female', dept: deptMap['ECE'], desig: 'Assistant Professor', joining: '2022-02-01' },
      { fid: 'FAC-007', name: 'Dr. Suresh Verma', email: 'suresh.verma@college.edu', phone: '+91 98765 43216', gender: 'Male', dept: deptMap['ME'], desig: 'Professor', joining: '2016-04-12' },
      { fid: 'FAC-008', name: 'Prof. Vikram Patel', email: 'vikram.patel@college.edu', phone: '+91 98765 43217', gender: 'Male', dept: deptMap['ME'], desig: 'Associate Professor', joining: '2019-11-20' },
      { fid: 'FAC-009', name: 'Dr. Meenakshi Sundaram', email: 'meenakshi.s@college.edu', phone: '+91 98765 43218', gender: 'Female', dept: deptMap['MBA'], desig: 'Professor', joining: '2015-08-10' },
      { fid: 'FAC-010', name: 'Prof. Neha Kapoor', email: 'neha.kapoor@college.edu', phone: '+91 98765 43219', gender: 'Female', dept: deptMap['MBA'], desig: 'Assistant Professor', joining: '2021-03-05' }
    ];

    const facultyMap = {};
    for (const f of faculties) {
      const res = await db.query(
        `INSERT INTO faculty (faculty_id, name, email, phone, gender, department_id, designation, joining_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Active')
         ON CONFLICT (faculty_id) DO UPDATE
         SET name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone, department_id = EXCLUDED.department_id, designation = EXCLUDED.designation
         RETURNING id, faculty_id`,
        [f.fid, f.name, f.email, f.phone, f.gender, f.dept, f.desig, f.joining]
      );
      facultyMap[f.fid] = res.rows[0].id;
    }
    console.log(`✓ Inserted/Updated ${faculties.length} faculty members`);

    // 5. Insert Subjects
    const subjects = [
      { name: 'Data Structures & Algorithms', code: 'CS301', course: courseMap['CS101'], sem: 3, credits: 4, desc: 'Core algorithm analysis, trees, graphs, and sorting techniques.' },
      { name: 'Database Management Systems', code: 'CS302', course: courseMap['CS101'], sem: 3, credits: 4, desc: 'Relational databases, SQL, normalization, and ACID properties.' },
      { name: 'Operating Systems', code: 'CS501', course: courseMap['CS101'], sem: 5, credits: 4, desc: 'Process management, concurrency, virtual memory, and file systems.' },
      { name: 'Artificial Intelligence & Machine Learning', code: 'CS701', course: courseMap['CS101'], sem: 7, credits: 4, desc: 'Supervised, unsupervised learning, neural networks, and heuristics.' },
      { name: 'Web Technologies', code: 'IT301', course: courseMap['IT101'], sem: 3, credits: 3, desc: 'Full-stack web architecture, React, Node.js, and RESTful APIs.' },
      { name: 'Cloud Computing Architecture', code: 'IT501', course: courseMap['IT101'], sem: 5, credits: 3, desc: 'Cloud virtualization, containers, Kubernetes, and AWS services.' },
      { name: 'Cyber Security & Cryptography', code: 'IT701', course: courseMap['IT101'], sem: 7, credits: 4, desc: 'Symmetric/asymmetric encryption, penetration testing, and security policies.' },
      { name: 'Digital Electronics', code: 'EC301', course: courseMap['EC101'], sem: 3, credits: 4, desc: 'Logic gates, Boolean algebra, flip-flops, and sequential circuits.' },
      { name: 'Microprocessors & Microcontrollers', code: 'EC501', course: courseMap['EC101'], sem: 5, credits: 4, desc: '8086/ARM architectures, assembly programming, and interfacing.' },
      { name: 'Thermodynamics & Heat Transfer', code: 'ME301', course: courseMap['ME101'], sem: 3, credits: 4, desc: 'First and second laws of thermodynamics, conduction and convection.' },
      { name: 'Fluid Mechanics', code: 'ME501', course: courseMap['ME101'], sem: 5, credits: 4, desc: 'Continuity, Navier-Stokes equations, and boundary layer theory.' },
      { name: 'Financial Management', code: 'MBA101', course: courseMap['MBA101'], sem: 1, credits: 3, desc: 'Capital budgeting, cash flow forecasting, and portfolio analysis.' },
      { name: 'Marketing Management', code: 'MBA201', course: courseMap['MBA101'], sem: 2, credits: 3, desc: 'Consumer behavior, branding strategies, and digital marketing.' },
      { name: 'Principles of Management', code: 'BBA101', course: courseMap['BBA101'], sem: 1, credits: 3, desc: 'Fundamentals of organizational planning, staffing, and directing.' },
      { name: 'Organizational Behavior', code: 'BBA201', course: courseMap['BBA101'], sem: 2, credits: 3, desc: 'Workplace psychology, leadership dynamics, and group behavior.' }
    ];

    const subjectMap = {};
    for (const s of subjects) {
      const res = await db.query(
        `INSERT INTO subjects (subject_name, subject_code, course_id, semester, credits, description, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'Active')
         ON CONFLICT (subject_code) DO UPDATE
         SET subject_name = EXCLUDED.subject_name, course_id = EXCLUDED.course_id, semester = EXCLUDED.semester, credits = EXCLUDED.credits
         RETURNING id, subject_code`,
        [s.name, s.code, s.course, s.sem, s.credits, s.desc]
      );
      subjectMap[s.code] = res.rows[0].id;
    }
    console.log(`✓ Inserted/Updated ${subjects.length} subjects`);

    // 6. Assign Faculty to Subjects
    const facultySubjectLinks = [
      { fid: 'FAC-001', scode: 'CS301' },
      { fid: 'FAC-001', scode: 'CS701' },
      { fid: 'FAC-002', scode: 'CS302' },
      { fid: 'FAC-002', scode: 'CS501' },
      { fid: 'FAC-003', scode: 'IT301' },
      { fid: 'FAC-003', scode: 'IT701' },
      { fid: 'FAC-004', scode: 'IT501' },
      { fid: 'FAC-005', scode: 'EC301' },
      { fid: 'FAC-006', scode: 'EC501' },
      { fid: 'FAC-007', scode: 'ME301' },
      { fid: 'FAC-008', scode: 'ME501' },
      { fid: 'FAC-009', scode: 'MBA101' },
      { fid: 'FAC-010', scode: 'MBA201' },
      { fid: 'FAC-009', scode: 'BBA101' },
      { fid: 'FAC-010', scode: 'BBA201' }
    ];

    for (const link of facultySubjectLinks) {
      await db.query(
        `INSERT INTO faculty_subjects (faculty_id, subject_id)
         VALUES ($1, $2)
         ON CONFLICT (faculty_id, subject_id) DO NOTHING`,
        [facultyMap[link.fid], subjectMap[link.scode]]
      );
    }
    console.log(`✓ Mapped faculty to subjects`);

    // 7. Insert Sample Students (25 students across departments)
    const rawStudents = [
      { sid: 'STU-2024-001', name: 'Aarav Patel', email: 'aarav.patel@student.edu', phone: '+91 91234 56701', gender: 'Male', dob: '2004-05-12', address: '12 Green Park, New Delhi', dept: deptMap['CSE'], course: courseMap['CS101'], year: 2, admission: '2023-08-01' },
      { sid: 'STU-2024-002', name: 'Diya Sharma', email: 'diya.sharma@student.edu', phone: '+91 91234 56702', gender: 'Female', dob: '2005-02-18', address: '45 Lake View, Mumbai', dept: deptMap['CSE'], course: courseMap['CS101'], year: 1, admission: '2024-08-01' },
      { sid: 'STU-2024-003', name: 'Ishaan Verma', email: 'ishaan.verma@student.edu', phone: '+91 91234 56703', gender: 'Male', dob: '2003-11-25', address: '88 Ring Road, Bangalore', dept: deptMap['CSE'], course: courseMap['CS101'], year: 3, admission: '2022-08-01' },
      { sid: 'STU-2024-004', name: 'Ananya Deshmukh', email: 'ananya.deshmukh@student.edu', phone: '+91 91234 56704', gender: 'Female', dob: '2002-07-14', address: '77 Shivaji Nagar, Pune', dept: deptMap['CSE'], course: courseMap['CS101'], year: 4, admission: '2021-08-01' },
      { sid: 'STU-2024-005', name: 'Rohan Iyer', email: 'rohan.iyer@student.edu', phone: '+91 91234 56705', gender: 'Male', dob: '2004-09-30', address: '19 Anna Salai, Chennai', dept: deptMap['IT'], course: courseMap['IT101'], year: 2, admission: '2023-08-01' },
      { sid: 'STU-2024-006', name: 'Kavya Reddy', email: 'kavya.reddy@student.edu', phone: '+91 91234 56706', gender: 'Female', dob: '2005-04-05', address: '33 Banjara Hills, Hyderabad', dept: deptMap['IT'], course: courseMap['IT101'], year: 1, admission: '2024-08-01' },
      { sid: 'STU-2024-007', name: 'Aditya Nair', email: 'aditya.nair@student.edu', phone: '+91 91234 56707', gender: 'Male', dob: '2003-01-19', address: '5 M.G. Road, Kochi', dept: deptMap['IT'], course: courseMap['IT101'], year: 3, admission: '2022-08-01' },
      { sid: 'STU-2024-008', name: 'Sneha Mukherjee', email: 'sneha.m@student.edu', phone: '+91 91234 56708', gender: 'Female', dob: '2002-12-08', address: '102 Salt Lake, Kolkata', dept: deptMap['IT'], course: courseMap['IT101'], year: 4, admission: '2021-08-01' },
      { sid: 'STU-2024-009', name: 'Karthik Rao', email: 'karthik.rao@student.edu', phone: '+91 91234 56709', gender: 'Male', dob: '2004-03-22', address: '64 Malleshwaram, Bangalore', dept: deptMap['ECE'], course: courseMap['EC101'], year: 2, admission: '2023-08-01' },
      { sid: 'STU-2024-010', name: 'Pooja Hegde', email: 'pooja.hegde@student.edu', phone: '+91 91234 56710', gender: 'Female', dob: '2005-06-15', address: '28 Light House Hill, Mangalore', dept: deptMap['ECE'], course: courseMap['EC101'], year: 1, admission: '2024-08-01' },
      { sid: 'STU-2024-011', name: 'Manish Joshi', email: 'manish.joshi@student.edu', phone: '+91 91234 56711', gender: 'Male', dob: '2003-08-11', address: '14 Civil Lines, Jaipur', dept: deptMap['ECE'], course: courseMap['EC101'], year: 3, admission: '2022-08-01' },
      { sid: 'STU-2024-012', name: 'Ritu Sen', email: 'ritu.sen@student.edu', phone: '+91 91234 56712', gender: 'Female', dob: '2002-10-04', address: '56 Park Street, Kolkata', dept: deptMap['ECE'], course: courseMap['EC101'], year: 4, admission: '2021-08-01' },
      { sid: 'STU-2024-013', name: 'Varun Chauhan', email: 'varun.chauhan@student.edu', phone: '+91 91234 56713', gender: 'Male', dob: '2004-01-28', address: '9 Sector 17, Chandigarh', dept: deptMap['ME'], course: courseMap['ME101'], year: 2, admission: '2023-08-01' },
      { sid: 'STU-2024-014', name: 'Meera Pillai', email: 'meera.pillai@student.edu', phone: '+91 91234 56714', gender: 'Female', dob: '2005-07-21', address: '81 Marine Drive, Kochi', dept: deptMap['ME'], course: courseMap['ME101'], year: 1, admission: '2024-08-01' },
      { sid: 'STU-2024-015', name: 'Gaurav Gill', email: 'gaurav.gill@student.edu', phone: '+91 91234 56715', gender: 'Male', dob: '2003-05-17', address: '30 GT Road, Amritsar', dept: deptMap['ME'], course: courseMap['ME101'], year: 3, admission: '2022-08-01' },
      { sid: 'STU-2024-016', name: 'Tanvi Saxena', email: 'tanvi.saxena@student.edu', phone: '+91 91234 56716', gender: 'Female', dob: '2002-09-12', address: '42 Hazratganj, Lucknow', dept: deptMap['ME'], course: courseMap['ME101'], year: 4, admission: '2021-08-01' },
      { sid: 'STU-2024-017', name: 'Nikhil Agarwal', email: 'nikhil.a@student.edu', phone: '+91 91234 56717', gender: 'Male', dob: '2000-04-10', address: '11 Connaught Place, New Delhi', dept: deptMap['MBA'], course: courseMap['MBA101'], year: 2, admission: '2023-08-01' },
      { sid: 'STU-2024-018', name: 'Shreya Ghosh', email: 'shreya.ghosh@student.edu', phone: '+91 91234 56718', gender: 'Female', dob: '2001-08-23', address: '23 Ballygunge, Kolkata', dept: deptMap['MBA'], course: courseMap['MBA101'], year: 1, admission: '2024-08-01' },
      { sid: 'STU-2024-019', name: 'Vikramaditya Roy', email: 'vikram.roy@student.edu', phone: '+91 91234 56719', gender: 'Male', dob: '2001-02-14', address: '90 Koregaon Park, Pune', dept: deptMap['MBA'], course: courseMap['MBA101'], year: 2, admission: '2023-08-01' },
      { sid: 'STU-2024-020', name: 'Priya Chawla', email: 'priya.chawla@student.edu', phone: '+91 91234 56720', gender: 'Female', dob: '2001-12-05', address: '16 Model Town, Ludhiana', dept: deptMap['MBA'], course: courseMap['MBA101'], year: 1, admission: '2024-08-01' },
      { sid: 'STU-2024-021', name: 'Sameer Khan', email: 'sameer.khan@student.edu', phone: '+91 91234 56721', gender: 'Male', dob: '2004-10-18', address: '71 Hazrat Nizamuddin, New Delhi', dept: deptMap['MBA'], course: courseMap['BBA101'], year: 2, admission: '2023-08-01' },
      { sid: 'STU-2024-022', name: 'Zoya Merchant', email: 'zoya.m@student.edu', phone: '+91 91234 56722', gender: 'Female', dob: '2005-03-29', address: '50 Colaba Causeway, Mumbai', dept: deptMap['MBA'], course: courseMap['BBA101'], year: 1, admission: '2024-08-01' },
      { sid: 'STU-2024-023', name: 'Devendra Bhatia', email: 'dev.bhatia@student.edu', phone: '+91 91234 56723', gender: 'Male', dob: '2003-06-16', address: '36 MI Road, Jaipur', dept: deptMap['MBA'], course: courseMap['BBA101'], year: 3, admission: '2022-08-01' },
      { sid: 'STU-2024-024', name: 'Tara Sundar', email: 'tara.sundar@student.edu', phone: '+91 91234 56724', gender: 'Female', dob: '2004-11-09', address: '22 T. Nagar, Chennai', dept: deptMap['CSE'], course: courseMap['CS101'], year: 2, admission: '2023-08-01' },
      { sid: 'STU-2024-025', name: 'Kabir Malhotra', email: 'kabir.m@student.edu', phone: '+91 91234 56725', gender: 'Male', dob: '2005-01-03', address: '60 Cyber City, Gurugram', dept: deptMap['IT'], course: courseMap['IT101'], year: 1, admission: '2024-08-01' }
    ];

    for (const s of rawStudents) {
      await db.query(
        `INSERT INTO students (student_id, name, email, phone, gender, date_of_birth, address, department_id, course_id, year, admission_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Active')
         ON CONFLICT (student_id) DO UPDATE
         SET name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone, department_id = EXCLUDED.department_id, course_id = EXCLUDED.course_id, year = EXCLUDED.year`,
        [s.sid, s.name, s.email, s.phone, s.gender, s.dob, s.address, s.dept, s.course, s.year, s.admission]
      );
    }
    console.log(`✓ Inserted/Updated ${rawStudents.length} students`);

    // 8. Insert Timetable
    // Clean old timetable
    await db.query('TRUNCATE TABLE timetable RESTART IDENTITY CASCADE');

    const timetableSlots = [
      { day: 'Monday', start: '09:00', end: '10:00', course: courseMap['CS101'], subject: subjectMap['CS301'], faculty: facultyMap['FAC-001'], room: 'LH-101' },
      { day: 'Monday', start: '10:15', end: '11:15', course: courseMap['CS101'], subject: subjectMap['CS302'], faculty: facultyMap['FAC-002'], room: 'LH-101' },
      { day: 'Monday', start: '11:30', end: '12:30', course: courseMap['IT101'], subject: subjectMap['IT301'], faculty: facultyMap['FAC-003'], room: 'LH-201' },
      { day: 'Tuesday', start: '09:00', end: '10:00', course: courseMap['CS101'], subject: subjectMap['CS501'], faculty: facultyMap['FAC-002'], room: 'LH-102' },
      { day: 'Tuesday', start: '10:15', end: '11:15', course: courseMap['EC101'], subject: subjectMap['EC301'], faculty: facultyMap['FAC-005'], room: 'EC-Lab-1' },
      { day: 'Tuesday', start: '11:30', end: '12:30', course: courseMap['ME101'], subject: subjectMap['ME301'], faculty: facultyMap['FAC-007'], room: 'ME-Seminar' },
      { day: 'Wednesday', start: '09:00', end: '10:00', course: courseMap['IT101'], subject: subjectMap['IT501'], faculty: facultyMap['FAC-004'], room: 'LH-202' },
      { day: 'Wednesday', start: '10:15', end: '11:15', course: courseMap['MBA101'], subject: subjectMap['MBA101'], faculty: facultyMap['FAC-009'], room: 'MBA-Hall-A' },
      { day: 'Wednesday', start: '11:30', end: '12:30', course: courseMap['BBA101'], subject: subjectMap['BBA101'], faculty: facultyMap['FAC-009'], room: 'MBA-Hall-B' },
      { day: 'Thursday', start: '09:00', end: '10:00', course: courseMap['CS101'], subject: subjectMap['CS701'], faculty: facultyMap['FAC-001'], room: 'AI-Lab' },
      { day: 'Thursday', start: '10:15', end: '11:15', course: courseMap['EC101'], subject: subjectMap['EC501'], faculty: facultyMap['FAC-006'], room: 'EC-Lab-2' },
      { day: 'Thursday', start: '11:30', end: '12:30', course: courseMap['ME101'], subject: subjectMap['ME501'], faculty: facultyMap['FAC-008'], room: 'Fluid-Lab' },
      { day: 'Friday', start: '09:00', end: '10:00', course: courseMap['IT101'], subject: subjectMap['IT701'], faculty: facultyMap['FAC-003'], room: 'Cyber-Lab' },
      { day: 'Friday', start: '10:15', end: '11:15', course: courseMap['MBA101'], subject: subjectMap['MBA201'], faculty: facultyMap['FAC-010'], room: 'MBA-Hall-A' },
      { day: 'Friday', start: '11:30', end: '12:30', course: courseMap['BBA101'], subject: subjectMap['BBA201'], faculty: facultyMap['FAC-010'], room: 'MBA-Hall-B' }
    ];

    for (const t of timetableSlots) {
      await db.query(
        `INSERT INTO timetable (day, start_time, end_time, course_id, subject_id, faculty_id, room_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [t.day, t.start, t.end, t.course, t.subject, t.faculty, t.room]
      );
    }
    console.log(`✓ Inserted ${timetableSlots.length} timetable entries`);

    // 9. Insert Realistic Initial Activity Logs
    await db.query('TRUNCATE TABLE activity_logs RESTART IDENTITY CASCADE');
    const logs = [
      { action: 'Department created', details: 'Added Department of Computer Science & Engineering', entity: 'department' },
      { action: 'Course added', details: 'Created B.Tech Computer Science (CS101)', entity: 'course' },
      { action: 'Faculty updated', details: 'Assigned Dr. Arvind Sharma as CSE Department Head', entity: 'faculty' },
      { action: 'Subject updated', details: 'Updated syllabus and credits for Data Structures & Algorithms', entity: 'subject' },
      { action: 'New student added', details: 'Enrolled Kabir Malhotra in B.Tech Information Technology', entity: 'student' },
      { action: 'Timetable changed', details: 'Allocated AI-Lab for CS701 lecture on Thursday', entity: 'timetable' }
    ];

    for (const l of logs) {
      await db.query(
        `INSERT INTO activity_logs (action, details, entity_type, created_at)
         VALUES ($1, $2, $3, NOW() - INTERVAL '${Math.floor(Math.random() * 48)} hours')`,
        [l.action, l.details, l.entity]
      );
    }
    console.log(`✓ Inserted ${logs.length} activity logs`);

    console.log('\n======================================================');
    console.log('✓ Database Seeding Completed Successfully!');
    console.log('Admin Credentials:');
    console.log('  Email:    admin@college.edu');
    console.log('  Password: AdminPassword123!');
    console.log('======================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seed:', error);
    process.exit(1);
  }
}

seed();
