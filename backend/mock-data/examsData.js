const examsData = [
  {
    id: "EXAM-2026-MID",
    name: "Mid-Semester Examination - Autumn 2026",
    academicYear: "2026-2027",
    semester: "Semester 5",
    startDate: "2026-10-18",
    endDate: "2026-10-28",
    status: "Active",
    subjects: [
      {
        subjectCode: "CS301",
        subjectName: "Data Structures & Algorithms",
        className: "CSE-3A",
        examDate: "2026-10-18",
        maxMarks: 50,
        submissionStatus: "Draft", // Draft, Saved, Submitted
        submittedAt: null,
        scores: [
          { scoreId: "SC001", studentId: "STU001", rollNumber: "23CS101", studentName: "Aakash Sharma", marks: 44, grade: "A", remarks: "Great attempt" },
          { scoreId: "SC002", studentId: "STU002", rollNumber: "23CS102", studentName: "Ananya Patel", marks: 48, grade: "A+", remarks: "Outstanding" },
          { scoreId: "SC003", studentId: "STU003", rollNumber: "23CS103", studentName: "Deepak Verma", marks: 32, grade: "B", remarks: "Average" },
          { scoreId: "SC004", studentId: "STU004", rollNumber: "23CS104", studentName: "Divya Nambiar", marks: 45, grade: "A", remarks: "Very good" },
          { scoreId: "SC005", studentId: "STU005", rollNumber: "23CS105", studentName: "Harish Iyer", marks: 36, grade: "B+", remarks: "Can improve" },
          { scoreId: "SC006", studentId: "STU006", rollNumber: "23CS106", studentName: "Ishita Roy", marks: 28, grade: "C", remarks: "Needs remediation" }
        ]
      },
      {
        subjectCode: "CS302",
        subjectName: "Database Management Systems",
        className: "CSE-3A",
        examDate: "2026-10-21",
        maxMarks: 50,
        submissionStatus: "Submitted",
        submittedAt: "2026-10-22 16:30",
        scores: [
          { scoreId: "SC007", studentId: "STU001", rollNumber: "23CS101", studentName: "Aakash Sharma", marks: 42, grade: "A", remarks: "Good conceptual clarity" },
          { scoreId: "SC008", studentId: "STU002", rollNumber: "23CS102", studentName: "Ananya Patel", marks: 49, grade: "A+", remarks: "Exceptional" },
          { scoreId: "SC009", studentId: "STU003", rollNumber: "23CS103", studentName: "Deepak Verma", marks: 34, grade: "B", remarks: "Satisfactory" },
          { scoreId: "SC010", studentId: "STU004", rollNumber: "23CS104", studentName: "Divya Nambiar", marks: 44, grade: "A", remarks: "Good work" },
          { scoreId: "SC011", studentId: "STU005", rollNumber: "23CS105", studentName: "Harish Iyer", marks: 38, grade: "B+", remarks: "Fair" },
          { scoreId: "SC012", studentId: "STU006", rollNumber: "23CS106", studentName: "Ishita Roy", marks: 30, grade: "C+", remarks: "Passing" }
        ]
      },
      {
        subjectCode: "CS305",
        subjectName: "Web Technologies & Architecture",
        className: "IT-3A",
        examDate: "2026-10-25",
        maxMarks: 50,
        submissionStatus: "Draft",
        submittedAt: null,
        scores: [
          { scoreId: "SC013", studentId: "STU011", rollNumber: "23IT301", studentName: "Rahul Deshmukh", marks: 45, grade: "A", remarks: "Solid full stack code" },
          { scoreId: "SC014", studentId: "STU012", rollNumber: "23IT302", studentName: "Roshni Sen", marks: 41, grade: "A", remarks: "Well written" },
          { scoreId: "SC015", studentId: "STU013", rollNumber: "23IT303", studentName: "Siddharth Malhotra", marks: 33, grade: "B", remarks: "Average" },
          { scoreId: "SC016", studentId: "STU014", rollNumber: "23IT304", studentName: "Tanvi Kulkarni", marks: 48, grade: "A+", remarks: "Excellent" }
        ]
      }
    ]
  },
  {
    id: "EXAM-2026-END",
    name: "End-Semester Examination - Autumn 2026",
    academicYear: "2026-2027",
    semester: "Semester 5",
    startDate: "2026-12-05",
    endDate: "2026-12-20",
    status: "Upcoming",
    subjects: [
      {
        subjectCode: "CS301",
        subjectName: "Data Structures & Algorithms",
        className: "CSE-3A",
        examDate: "2026-12-08",
        maxMarks: 100,
        submissionStatus: "Draft",
        submittedAt: null,
        scores: []
      }
    ]
  }
];

module.exports = { examsData };
