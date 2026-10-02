export const facultyList = [
  {
    id: "FAC001",
    name: "Dr. Ramesh Nair",
    employeeId: "EMP-CS-101",
    department: "Computer Science & Engineering",
    designation: "Associate Professor & HOD",
    email: "faculty@cms.com",
    joiningDate: "2015-07-15",
    experience: "12 Years",
    qualification: "Ph.D. in Computer Science (IIT Madras), M.Tech (NITK)",
    assignedSubjects: [
      { code: "CS301", name: "Design & Analysis of Algorithms", class: "CSE-3A", credits: 4, weeklyHours: 4, studentsCount: 10, completion: 68 },
      { code: "CS305", name: "Computer Networks", class: "CSE-3A", credits: 3, weeklyHours: 3, studentsCount: 10, completion: 72 }
    ],
    weeklyHours: 14,
    phone: "+91 94470 12345",
    officeRoom: "Room 408, Department Block 3",
    researchAreas: "Algorithms, Distributed Systems, Graph Neural Networks"
  },
  {
    id: "FAC002",
    name: "Prof. Ananya Sen",
    employeeId: "EMP-CS-105",
    department: "Computer Science & Engineering",
    designation: "Assistant Professor",
    email: "ananya.sen@cms.com",
    joiningDate: "2018-08-01",
    experience: "7 Years",
    qualification: "M.Tech in Data Engineering (IIITB), B.Tech (CSE)",
    assignedSubjects: [
      { code: "CS302", name: "Database Management Systems", class: "CSE-3A", credits: 4, weeklyHours: 4, studentsCount: 10, completion: 75 },
      { code: "CS307", name: "DBMS Laboratory", class: "CSE-3A", credits: 2, weeklyHours: 3, studentsCount: 10, completion: 80 }
    ],
    weeklyHours: 15,
    phone: "+91 94470 23456",
    officeRoom: "Room 412, Department Block 3",
    researchAreas: "Database Optimization, Cloud Databases"
  },
  {
    id: "FAC003",
    name: "Dr. Vikram Joshi",
    employeeId: "EMP-IT-108",
    department: "Information Technology",
    designation: "Professor",
    email: "vikram.joshi@cms.com",
    joiningDate: "2012-01-10",
    experience: "16 Years",
    qualification: "Ph.D. in Cyber Security (IISc Bangalore)",
    assignedSubjects: [
      { code: "CS303", name: "Operating Systems", class: "CSE-3A", credits: 4, weeklyHours: 4, studentsCount: 10, completion: 60 },
      { code: "CS304", name: "Software Engineering & Agile", class: "CSE-3A", credits: 3, weeklyHours: 3, studentsCount: 10, completion: 65 }
    ],
    weeklyHours: 16,
    phone: "+91 94470 34567",
    officeRoom: "Room 501, Technology Block",
    researchAreas: "Information Security, Kernel Architecture"
  }
];
