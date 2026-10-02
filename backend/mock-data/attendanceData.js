const attendanceData = [
  {
    id: "ATT001",
    facultyId: "FAC001",
    date: "2026-09-28",
    subjectCode: "CS301",
    subjectName: "Data Structures & Algorithms",
    className: "CSE-3A",
    totalStudents: 6,
    presentCount: 5,
    absentCount: 1,
    status: "Submitted",
    records: [
      { studentId: "STU001", studentName: "Aakash Sharma", rollNumber: "23CS101", status: "Present", remarks: "" },
      { studentId: "STU002", studentName: "Ananya Patel", rollNumber: "23CS102", status: "Present", remarks: "" },
      { studentId: "STU003", studentName: "Deepak Verma", rollNumber: "23CS103", status: "Absent", remarks: "Medical Leave" },
      { studentId: "STU004", studentName: "Divya Nambiar", rollNumber: "23CS104", status: "Present", remarks: "" },
      { studentId: "STU005", studentName: "Harish Iyer", rollNumber: "23CS105", status: "Present", remarks: "" },
      { studentId: "STU006", studentName: "Ishita Roy", rollNumber: "23CS106", status: "Present", remarks: "" }
    ]
  },
  {
    id: "ATT002",
    facultyId: "FAC001",
    date: "2026-09-29",
    subjectCode: "CS302",
    subjectName: "Database Management Systems",
    className: "CSE-3A",
    totalStudents: 6,
    presentCount: 6,
    absentCount: 0,
    status: "Submitted",
    records: [
      { studentId: "STU001", studentName: "Aakash Sharma", rollNumber: "23CS101", status: "Present", remarks: "" },
      { studentId: "STU002", studentName: "Ananya Patel", rollNumber: "23CS102", status: "Present", remarks: "" },
      { studentId: "STU003", studentName: "Deepak Verma", rollNumber: "23CS103", status: "Present", remarks: "" },
      { studentId: "STU004", studentName: "Divya Nambiar", rollNumber: "23CS104", status: "Present", remarks: "" },
      { studentId: "STU005", studentName: "Harish Iyer", rollNumber: "23CS105", status: "Present", remarks: "" },
      { studentId: "STU006", studentName: "Ishita Roy", rollNumber: "23CS106", status: "Present", remarks: "" }
    ]
  },
  {
    id: "ATT003",
    facultyId: "FAC001",
    date: "2026-09-30",
    subjectCode: "CS305",
    subjectName: "Web Technologies & Architecture",
    className: "IT-3A",
    totalStudents: 4,
    presentCount: 3,
    absentCount: 1,
    status: "Submitted",
    records: [
      { studentId: "STU011", studentName: "Rahul Deshmukh", rollNumber: "23IT301", status: "Present", remarks: "" },
      { studentId: "STU012", studentName: "Roshni Sen", rollNumber: "23IT302", status: "Present", remarks: "" },
      { studentId: "STU013", studentName: "Siddharth Malhotra", rollNumber: "23IT303", status: "Absent", remarks: "Unexcused" },
      { studentId: "STU014", studentName: "Tanvi Kulkarni", rollNumber: "23IT304", status: "Present", remarks: "" }
    ]
  }
];

module.exports = { attendanceData };
