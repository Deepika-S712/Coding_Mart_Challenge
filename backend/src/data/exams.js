export const examTimetable = [
  {
    id: "EX001",
    examName: "Mid-Semester Examination (Oct 2026)",
    subjectCode: "CS301",
    subjectName: "Design & Analysis of Algorithms",
    date: "2026-10-15",
    day: "Thursday",
    startTime: "10:00 AM",
    endTime: "12:00 PM",
    duration: "2 Hours",
    room: "Exam Hall 1 (Ground Floor)",
    maxMarks: 50,
    isNext: true
  },
  {
    id: "EX002",
    examName: "Mid-Semester Examination (Oct 2026)",
    subjectCode: "CS302",
    subjectName: "Database Management Systems",
    date: "2026-10-17",
    day: "Saturday",
    startTime: "10:00 AM",
    endTime: "12:00 PM",
    duration: "2 Hours",
    room: "Exam Hall 1 (Ground Floor)",
    maxMarks: 50,
    isNext: false
  },
  {
    id: "EX003",
    examName: "Mid-Semester Examination (Oct 2026)",
    subjectCode: "CS303",
    subjectName: "Operating Systems",
    date: "2026-10-20",
    day: "Tuesday",
    startTime: "10:00 AM",
    endTime: "12:00 PM",
    duration: "2 Hours",
    room: "Exam Hall 2 (First Floor)",
    maxMarks: 50,
    isNext: false
  },
  {
    id: "EX004",
    examName: "Mid-Semester Examination (Oct 2026)",
    subjectCode: "CS304",
    subjectName: "Software Engineering & Agile",
    date: "2026-10-22",
    day: "Thursday",
    startTime: "10:00 AM",
    endTime: "12:00 PM",
    duration: "2 Hours",
    room: "Exam Hall 2 (First Floor)",
    maxMarks: 50,
    isNext: false
  },
  {
    id: "EX005",
    examName: "Mid-Semester Examination (Oct 2026)",
    subjectCode: "CS305",
    subjectName: "Computer Networks",
    date: "2026-10-24",
    day: "Saturday",
    startTime: "10:00 AM",
    endTime: "12:00 PM",
    duration: "2 Hours",
    room: "Exam Hall 1 (Ground Floor)",
    maxMarks: 50,
    isNext: false
  }
];

export const examScores = [
  {
    id: "EXM-SCORE-CS301-MID",
    examType: "Mid Semester",
    subjectCode: "CS301",
    subjectName: "Design & Analysis of Algorithms",
    class: "CSE-3A",
    facultyId: "FAC001",
    maxMarks: 50,
    status: "DRAFT", // 'DRAFT' or 'SUBMITTED'
    scores: [
      { studentId: "STU001", rollNo: "21CS001", studentName: "Kamal Sandeep", marks: 46, grade: "A+", remarks: "Excellent algorithmic clarity" },
      { studentId: "STU002", rollNo: "21CS002", studentName: "Arun Kumar", marks: 41, grade: "A", remarks: "Good problem solving" },
      { studentId: "STU003", rollNo: "21CS003", studentName: "Priya Sharma", marks: 49, grade: "O", remarks: "Outstanding performance" },
      { studentId: "STU004", rollNo: "21CS004", studentName: "Rahul Raj", marks: 34, grade: "B+", remarks: "Needs more DP practice" },
      { studentId: "STU005", rollNo: "21CS005", studentName: "Divya S", marks: 45, grade: "A+", remarks: "Well structured proofs" },
      { studentId: "STU006", rollNo: "21CS006", studentName: "Karthik Venkatesh", marks: 38, grade: "B+", remarks: "Satisfactory" },
      { studentId: "STU007", rollNo: "21CS007", studentName: "Ananya Iyer", marks: 47, grade: "O", remarks: "Very clean time complexity analysis" },
      { studentId: "STU008", rollNo: "21CS008", studentName: "Mohammed Faizan", marks: 32, grade: "B", remarks: "Work on graph algorithms" },
      { studentId: "STU009", rollNo: "21CS009", studentName: "Sneha Reddy", marks: 43, grade: "A", remarks: "Good code design" },
      { studentId: "STU010", rollNo: "21CS010", studentName: "Aditya Verma", marks: 40, grade: "A", remarks: "Good effort" }
    ]
  },
  {
    id: "EXM-SCORE-CS302-MID",
    examType: "Mid Semester",
    subjectCode: "CS302",
    subjectName: "Database Management Systems",
    class: "CSE-3A",
    facultyId: "FAC002",
    maxMarks: 50,
    status: "SUBMITTED", // locked
    scores: [
      { studentId: "STU001", rollNo: "21CS001", studentName: "Kamal Sandeep", marks: 44, grade: "A+", remarks: "Strong SQL queries" },
      { studentId: "STU002", rollNo: "21CS002", studentName: "Arun Kumar", marks: 39, grade: "B+", remarks: "Review B+ Trees" },
      { studentId: "STU003", rollNo: "21CS003", studentName: "Priya Sharma", marks: 48, grade: "O", remarks: "Flawless Normalization" },
      { studentId: "STU004", rollNo: "21CS004", studentName: "Rahul Raj", marks: 36, grade: "B+", remarks: "Good conceptual grasp" },
      { studentId: "STU005", rollNo: "21CS005", studentName: "Divya S", marks: 46, grade: "A+", remarks: "Great schema design" },
      { studentId: "STU006", rollNo: "21CS006", studentName: "Karthik Venkatesh", marks: 37, grade: "B+", remarks: "Satisfactory" },
      { studentId: "STU007", rollNo: "21CS007", studentName: "Ananya Iyer", marks: 45, grade: "A+", remarks: "Very good understanding" },
      { studentId: "STU008", rollNo: "21CS008", studentName: "Mohammed Faizan", marks: 35, grade: "B+", remarks: "Revise concurrency control" },
      { studentId: "STU009", rollNo: "21CS009", studentName: "Sneha Reddy", marks: 42, grade: "A", remarks: "Good work" },
      { studentId: "STU010", rollNo: "21CS010", studentName: "Aditya Verma", marks: 41, grade: "A", remarks: "Solid queries" }
    ]
  }
];
