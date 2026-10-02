// In-memory attendance records
// Overall student attendance summary + date-wise session attendance sheets

export const studentAttendanceSummary = {
  "STU001": {
    overallPercentage: 91.2,
    totalHeld: 170,
    totalAttended: 155,
    monthlyTrend: [
      { month: "June", percentage: 92 },
      { month: "July", percentage: 86 },
      { month: "August", percentage: 89 },
      { month: "September", percentage: 94 },
      { month: "October", percentage: 91 }
    ],
    subjectBreakdown: [
      { subjectCode: "CS301", subjectName: "Design & Analysis of Algorithms", facultyName: "Dr. Ramesh Nair", held: 28, attended: 26, percentage: 92.8 },
      { subjectCode: "CS302", subjectName: "Database Management Systems", facultyName: "Prof. Ananya Sen", held: 26, attended: 24, percentage: 92.3 },
      { subjectCode: "CS303", subjectName: "Operating Systems", facultyName: "Dr. Vikram Joshi", held: 24, attended: 21, percentage: 87.5 },
      { subjectCode: "CS304", subjectName: "Software Engineering & Agile", facultyName: "Dr. Vikram Joshi", held: 22, attended: 20, percentage: 90.9 },
      { subjectCode: "CS305", subjectName: "Computer Networks", facultyName: "Dr. Ramesh Nair", held: 25, attended: 23, percentage: 92.0 },
      { subjectCode: "CS306", subjectName: "Algorithms Laboratory", facultyName: "Dr. Ramesh Nair", held: 18, attended: 17, percentage: 94.4 },
      { subjectCode: "CS307", subjectName: "DBMS Laboratory", facultyName: "Prof. Ananya Sen", held: 15, attended: 14, percentage: 93.3 },
      { subjectCode: "HS301", subjectName: "Professional Ethics & Human Values", facultyName: "Prof. Ananya Sen", held: 12, attended: 10, percentage: 83.3 }
    ]
  }
};

export const attendanceSessions = [
  {
    id: "ATT-2026-10-01-CS301",
    date: "2026-10-01",
    subjectCode: "CS301",
    subjectName: "Design & Analysis of Algorithms",
    class: "CSE-3A",
    facultyId: "FAC001",
    period: "Period 1 (09:30 - 10:15)",
    records: [
      { studentId: "STU001", studentName: "Kamal Sandeep", rollNo: "21CS001", status: "PRESENT" },
      { studentId: "STU002", studentName: "Arun Kumar", rollNo: "21CS002", status: "PRESENT" },
      { studentId: "STU003", studentName: "Priya Sharma", rollNo: "21CS003", status: "PRESENT" },
      { studentId: "STU004", studentName: "Rahul Raj", rollNo: "21CS004", status: "ABSENT" },
      { studentId: "STU005", studentName: "Divya S", rollNo: "21CS005", status: "PRESENT" },
      { studentId: "STU006", studentName: "Karthik Venkatesh", rollNo: "21CS006", status: "PRESENT" },
      { studentId: "STU007", studentName: "Ananya Iyer", rollNo: "21CS007", status: "PRESENT" },
      { studentId: "STU008", studentName: "Mohammed Faizan", rollNo: "21CS008", status: "ABSENT" },
      { studentId: "STU009", studentName: "Sneha Reddy", rollNo: "21CS009", status: "PRESENT" },
      { studentId: "STU010", studentName: "Aditya Verma", rollNo: "21CS010", status: "PRESENT" }
    ]
  },
  {
    id: "ATT-2026-10-01-CS302",
    date: "2026-10-01",
    subjectCode: "CS302",
    subjectName: "Database Management Systems",
    class: "CSE-3A",
    facultyId: "FAC002",
    period: "Period 2 (10:15 - 11:00)",
    records: [
      { studentId: "STU001", studentName: "Kamal Sandeep", rollNo: "21CS001", status: "PRESENT" },
      { studentId: "STU002", studentName: "Arun Kumar", rollNo: "21CS002", status: "PRESENT" },
      { studentId: "STU003", studentName: "Priya Sharma", rollNo: "21CS003", status: "PRESENT" },
      { studentId: "STU004", studentName: "Rahul Raj", rollNo: "21CS004", status: "PRESENT" },
      { studentId: "STU005", studentName: "Divya S", rollNo: "21CS005", status: "PRESENT" },
      { studentId: "STU006", studentName: "Karthik Venkatesh", rollNo: "21CS006", status: "ABSENT" },
      { studentId: "STU007", studentName: "Ananya Iyer", rollNo: "21CS007", status: "PRESENT" },
      { studentId: "STU008", studentName: "Mohammed Faizan", rollNo: "21CS008", status: "PRESENT" },
      { studentId: "STU009", studentName: "Sneha Reddy", rollNo: "21CS009", status: "PRESENT" },
      { studentId: "STU010", studentName: "Aditya Verma", rollNo: "21CS010", status: "PRESENT" }
    ]
  }
];
