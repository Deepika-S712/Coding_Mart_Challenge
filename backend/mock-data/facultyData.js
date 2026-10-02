const facultyData = [
  {
    id: "FAC001",
    name: "Arun Kumar",
    email: "teacher@college.edu",
    password: "password123", // In-memory auth comparison
    role: "FACULTY",
    department: "Computer Science & Engineering",
    designation: "Associate Professor",
    phone: "+91 98765 43210",
    office: "Room 304, Academic Block A",
    qualification: "Ph.D. in Computer Science",
    experienceYears: 12,
    joiningDate: "2014-08-01",
    assignedSubjects: ["CS301", "CS302", "CS305"],
    assignedClasses: ["CSE-3A", "CSE-3B", "IT-3A"]
  }
];

const subjectsData = [
  {
    id: "CS301",
    code: "CS301",
    name: "Data Structures & Algorithms",
    department: "Computer Science & Engineering",
    semester: 5,
    credits: 4,
    assignedFacultyId: "FAC001",
    assignedClasses: ["CSE-3A", "CSE-3B"],
    totalStudents: 58,
    syllabusProgress: 72
  },
  {
    id: "CS302",
    code: "CS302",
    name: "Database Management Systems",
    department: "Computer Science & Engineering",
    semester: 5,
    credits: 3,
    assignedFacultyId: "FAC001",
    assignedClasses: ["CSE-3A"],
    totalStudents: 30,
    syllabusProgress: 65
  },
  {
    id: "CS305",
    code: "CS305",
    name: "Web Technologies & Architecture",
    department: "Information Technology",
    semester: 5,
    credits: 3,
    assignedFacultyId: "FAC001",
    assignedClasses: ["IT-3A"],
    totalStudents: 28,
    syllabusProgress: 80
  }
];

module.exports = { facultyData, subjectsData };
