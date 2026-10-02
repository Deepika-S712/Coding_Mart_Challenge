export const studentFees = [
  {
    id: "FEE001",
    studentId: "STU001",
    studentName: "Kamal Sandeep",
    rollNo: "21CS001",
    department: "Computer Science & Engineering",
    semester: "Semester 5",
    academicYear: "2026-2027",
    breakdown: {
      tuitionFee: 65000,
      examFee: 3500,
      hostelFee: 30000,
      cabFee: 0,
      otherFee: 4000,
      scholarship: 15000
    },
    totalFee: 87500, // (65000+3500+30000+4000) - 15000 scholarship
    paidAmount: 65000,
    pendingAmount: 22500,
    dueDate: "2026-10-25",
    status: "Partially Paid" // Paid, Partially Paid, Unpaid, Scholarship
  },
  {
    id: "FEE002",
    studentId: "STU002",
    studentName: "Arun Kumar",
    rollNo: "21CS002",
    department: "Computer Science & Engineering",
    semester: "Semester 5",
    academicYear: "2026-2027",
    breakdown: {
      tuitionFee: 65000,
      examFee: 3500,
      hostelFee: 0,
      cabFee: 12000,
      otherFee: 4000,
      scholarship: 0
    },
    totalFee: 84500,
    paidAmount: 84500,
    pendingAmount: 0,
    dueDate: "2026-10-15",
    status: "Paid"
  },
  {
    id: "FEE003",
    studentId: "STU003",
    studentName: "Priya Sharma",
    rollNo: "21CS003",
    department: "Computer Science & Engineering",
    semester: "Semester 5",
    academicYear: "2026-2027",
    breakdown: {
      tuitionFee: 65000,
      examFee: 3500,
      hostelFee: 30000,
      cabFee: 0,
      otherFee: 4000,
      scholarship: 25000
    },
    totalFee: 77500,
    paidAmount: 77500,
    pendingAmount: 0,
    dueDate: "2026-10-10",
    status: "Paid"
  },
  {
    id: "FEE004",
    studentId: "STU004",
    studentName: "Rahul Raj",
    rollNo: "21CS004",
    department: "Computer Science & Engineering",
    semester: "Semester 5",
    academicYear: "2026-2027",
    breakdown: {
      tuitionFee: 65000,
      examFee: 3500,
      hostelFee: 0,
      cabFee: 12000,
      otherFee: 4000,
      scholarship: 0
    },
    totalFee: 84500,
    paidAmount: 0,
    pendingAmount: 84500,
    dueDate: "2026-09-30",
    status: "Unpaid"
  },
  {
    id: "FEE005",
    studentId: "STU005",
    studentName: "Divya S",
    rollNo: "21CS005",
    department: "Computer Science & Engineering",
    semester: "Semester 5",
    academicYear: "2026-2027",
    breakdown: {
      tuitionFee: 65000,
      examFee: 3500,
      hostelFee: 0,
      cabFee: 0,
      otherFee: 4000,
      scholarship: 10000
    },
    totalFee: 62500,
    paidAmount: 62500,
    pendingAmount: 0,
    dueDate: "2026-10-15",
    status: "Paid"
  },
  {
    id: "FEE006",
    studentId: "STU006",
    studentName: "Karthik Venkatesh",
    rollNo: "21CS006",
    department: "Computer Science & Engineering",
    semester: "Semester 5",
    academicYear: "2026-2027",
    breakdown: {
      tuitionFee: 65000,
      examFee: 3500,
      hostelFee: 30000,
      cabFee: 0,
      otherFee: 4000,
      scholarship: 0
    },
    totalFee: 102500,
    paidAmount: 50000,
    pendingAmount: 52500,
    dueDate: "2026-09-20",
    status: "Partially Paid"
  },
  {
    id: "FEE007",
    studentId: "STU007",
    studentName: "Ananya Iyer",
    rollNo: "21CS007",
    department: "Computer Science & Engineering",
    semester: "Semester 5",
    academicYear: "2026-2027",
    breakdown: {
      tuitionFee: 65000,
      examFee: 3500,
      hostelFee: 0,
      cabFee: 12000,
      otherFee: 4000,
      scholarship: 20000
    },
    totalFee: 64500,
    paidAmount: 64500,
    pendingAmount: 0,
    dueDate: "2026-10-05",
    status: "Paid"
  },
  {
    id: "FEE008",
    studentId: "STU008",
    studentName: "Mohammed Faizan",
    rollNo: "21CS008",
    department: "Computer Science & Engineering",
    semester: "Semester 5",
    academicYear: "2026-2027",
    breakdown: {
      tuitionFee: 65000,
      examFee: 3500,
      hostelFee: 30000,
      cabFee: 0,
      otherFee: 4000,
      scholarship: 0
    },
    totalFee: 102500,
    paidAmount: 30000,
    pendingAmount: 72500,
    dueDate: "2026-09-15",
    status: "Partially Paid"
  },
  {
    id: "FEE009",
    studentId: "STU009",
    studentName: "Sneha Reddy",
    rollNo: "21CS009",
    department: "Computer Science & Engineering",
    semester: "Semester 5",
    academicYear: "2026-2027",
    breakdown: {
      tuitionFee: 65000,
      examFee: 3500,
      hostelFee: 0,
      cabFee: 12000,
      otherFee: 4000,
      scholarship: 0
    },
    totalFee: 84500,
    paidAmount: 84500,
    pendingAmount: 0,
    dueDate: "2026-10-12",
    status: "Paid"
  },
  {
    id: "FEE010",
    studentId: "STU010",
    studentName: "Aditya Verma",
    rollNo: "21CS010",
    department: "Computer Science & Engineering",
    semester: "Semester 5",
    academicYear: "2026-2027",
    breakdown: {
      tuitionFee: 65000,
      examFee: 3500,
      hostelFee: 30000,
      cabFee: 0,
      otherFee: 4000,
      scholarship: 10000
    },
    totalFee: 92500,
    paidAmount: 40000,
    pendingAmount: 52500,
    dueDate: "2026-09-25",
    status: "Partially Paid"
  }
];
