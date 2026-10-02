const assignmentsData = [
  {
    id: "ASN001",
    facultyId: "FAC001",
    title: "Assignment 1: Heap Sort & Priority Queues",
    subjectCode: "CS301",
    subjectName: "Data Structures & Algorithms",
    className: "CSE-3A",
    dueDate: "2026-10-10",
    dueTime: "23:59",
    maxMarks: 50,
    status: "Published",
    instructions: "Implement max-heap and min-heap in C++ or Java. Solve 3 leetcode-style problems attached in the PDF.",
    attachmentUrl: "/assignments/cs301-assignment-1.pdf",
    totalStudents: 6,
    submittedCount: 5,
    gradedCount: 3,
    submissions: [
      {
        submissionId: "SUB001",
        studentId: "STU001",
        studentName: "Aakash Sharma",
        rollNumber: "23CS101",
        submittedAt: "2026-10-02 14:30",
        fileUrl: "/submissions/aakash_asn1.zip",
        fileName: "aakash_asn1.zip",
        status: "Graded",
        score: 46,
        feedback: "Excellent heapify implementation. Clean asymptotic complexity explanations."
      },
      {
        submissionId: "SUB002",
        studentId: "STU002",
        studentName: "Ananya Patel",
        rollNumber: "23CS102",
        submittedAt: "2026-10-03 10:15",
        fileUrl: "/submissions/ananya_asn1.zip",
        fileName: "ananya_asn1.zip",
        status: "Graded",
        score: 49,
        feedback: "Outstanding work! Corner cases handled seamlessly."
      },
      {
        submissionId: "SUB003",
        studentId: "STU003",
        studentName: "Deepak Verma",
        rollNumber: "23CS103",
        submittedAt: "2026-10-04 18:00",
        fileUrl: "/submissions/deepak_asn1.zip",
        fileName: "deepak_asn1.zip",
        status: "Graded",
        score: 38,
        feedback: "Fix off-by-one indexing error in extract-max."
      },
      {
        submissionId: "SUB004",
        studentId: "STU004",
        studentName: "Divya Nambiar",
        rollNumber: "23CS104",
        submittedAt: "2026-10-05 09:40",
        fileUrl: "/submissions/divya_asn1.zip",
        fileName: "divya_asn1.zip",
        status: "Pending",
        score: null,
        feedback: ""
      },
      {
        submissionId: "SUB005",
        studentId: "STU005",
        studentName: "Harish Iyer",
        rollNumber: "23CS105",
        submittedAt: "2026-10-05 11:20",
        fileUrl: "/submissions/harish_asn1.zip",
        fileName: "harish_asn1.zip",
        status: "Pending",
        score: null,
        feedback: ""
      }
    ]
  },
  {
    id: "ASN002",
    facultyId: "FAC001",
    title: "Assignment 2: Schema Design & Complex SQL Queries",
    subjectCode: "CS302",
    subjectName: "Database Management Systems",
    className: "CSE-3A",
    dueDate: "2026-10-15",
    dueTime: "23:59",
    maxMarks: 40,
    status: "Published",
    instructions: "Design an ER diagram for a Hospital Management System and write 10 nested aggregate SQL queries.",
    attachmentUrl: "/assignments/cs302-assignment-2.pdf",
    totalStudents: 6,
    submittedCount: 4,
    gradedCount: 2,
    submissions: [
      {
        submissionId: "SUB006",
        studentId: "STU001",
        studentName: "Aakash Sharma",
        rollNumber: "23CS101",
        submittedAt: "2026-10-04 16:20",
        fileUrl: "/submissions/aakash_asn2.pdf",
        fileName: "aakash_asn2.pdf",
        status: "Graded",
        score: 38,
        feedback: "Well structured normalization."
      },
      {
        submissionId: "SUB007",
        studentId: "STU002",
        studentName: "Ananya Patel",
        rollNumber: "23CS102",
        submittedAt: "2026-10-04 17:00",
        fileUrl: "/submissions/ananya_asn2.pdf",
        fileName: "ananya_asn2.pdf",
        status: "Graded",
        score: 40,
        feedback: "Flawless SQL subqueries and indexing."
      }
    ]
  },
  {
    id: "ASN003",
    facultyId: "FAC001",
    title: "Mini-Project: Responsive SPA using Modern React",
    subjectCode: "CS305",
    subjectName: "Web Technologies & Architecture",
    className: "IT-3A",
    dueDate: "2026-10-25",
    dueTime: "17:00",
    maxMarks: 100,
    status: "Draft",
    instructions: "Build a responsive frontend web app adhering strictly to modern UI design guidelines.",
    attachmentUrl: "",
    totalStudents: 4,
    submittedCount: 0,
    gradedCount: 0,
    submissions: []
  }
];

module.exports = { assignmentsData };
