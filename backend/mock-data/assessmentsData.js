const assessmentsData = [
  {
    id: "ASM001",
    facultyId: "FAC001",
    title: "Unit Test 1: Asymptotic Analysis & Recursion",
    assessmentType: "Unit Test",
    subjectCode: "CS301",
    subjectName: "Data Structures & Algorithms",
    className: "CSE-3A",
    date: "2026-09-20",
    maxMarks: 25,
    status: "Completed",
    marksSubmitted: true,
    results: [
      { studentId: "STU001", studentName: "Aakash Sharma", rollNumber: "23CS101", marksObtained: 23, remarks: "Good grasp of Master Theorem" },
      { studentId: "STU002", studentName: "Ananya Patel", rollNumber: "23CS102", marksObtained: 25, remarks: "Perfect score" },
      { studentId: "STU003", studentName: "Deepak Verma", rollNumber: "23CS103", marksObtained: 17, remarks: "Needs practice with recurrence trees" },
      { studentId: "STU004", studentName: "Divya Nambiar", rollNumber: "23CS104", marksObtained: 22, remarks: "Very good" },
      { studentId: "STU005", studentName: "Harish Iyer", rollNumber: "23CS105", marksObtained: 19, remarks: "Minor calculation mistakes" },
      { studentId: "STU006", studentName: "Ishita Roy", rollNumber: "23CS106", marksObtained: 15, remarks: "Review Big-O definitions" }
    ]
  },
  {
    id: "ASM002",
    facultyId: "FAC001",
    title: "Continuous Assessment 1: ER Modeling & SQL Lab",
    assessmentType: "Lab Quiz",
    subjectCode: "CS302",
    subjectName: "Database Management Systems",
    className: "CSE-3A",
    date: "2026-09-27",
    maxMarks: 20,
    status: "Completed",
    marksSubmitted: true,
    results: [
      { studentId: "STU001", studentName: "Aakash Sharma", rollNumber: "23CS101", marksObtained: 18, remarks: "Clean table joins" },
      { studentId: "STU002", studentName: "Ananya Patel", rollNumber: "23CS102", marksObtained: 20, remarks: "Excellent schema normalization" },
      { studentId: "STU003", studentName: "Deepak Verma", rollNumber: "23CS103", marksObtained: 14, remarks: "Check foreign key constraints" },
      { studentId: "STU004", studentName: "Divya Nambiar", rollNumber: "23CS104", marksObtained: 19, remarks: "Good query optimization" },
      { studentId: "STU005", studentName: "Harish Iyer", rollNumber: "23CS105", marksObtained: 16, remarks: "Satisfactory" },
      { studentId: "STU006", studentName: "Ishita Roy", rollNumber: "23CS106", marksObtained: 13, remarks: "Needs more practice on GROUP BY" }
    ]
  },
  {
    id: "ASM003",
    facultyId: "FAC001",
    title: "Quiz 2: Non-Linear Data Structures & Trees",
    assessmentType: "Quiz",
    subjectCode: "CS301",
    subjectName: "Data Structures & Algorithms",
    className: "CSE-3A",
    date: "2026-10-14",
    maxMarks: 30,
    status: "Scheduled",
    marksSubmitted: false,
    results: []
  }
];

module.exports = { assessmentsData };
