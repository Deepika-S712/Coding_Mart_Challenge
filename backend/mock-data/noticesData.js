const noticesData = [
  {
    id: "NTC001",
    facultyId: "FAC001",
    title: "Mid-Term Project Milestone 1 Presentation Schedule",
    category: "Academic",
    targetAudience: "CSE-3A, CSE-3B",
    priority: "High",
    publishDate: "2026-10-01",
    content: "All student teams must submit their preliminary architectural design diagram and GitHub repository link by Friday 5 PM.",
    authorName: "Dr. Arun Kumar",
    pinned: true
  },
  {
    id: "NTC002",
    facultyId: "FAC001",
    title: "Remedial / Doubt Clearing Session for DSA Graphs",
    category: "Academic",
    targetAudience: "CSE-3A",
    priority: "Normal",
    publishDate: "2026-09-29",
    content: "An extra doubt-clearing session for topological sort and minimum spanning tree algorithms is scheduled for Saturday 11:00 AM in Lab 3B.",
    authorName: "Dr. Arun Kumar",
    pinned: false
  },
  {
    id: "NTC003",
    facultyId: "FAC001",
    title: "Submission Deadline Extension for DBMS Lab Assignment 2",
    category: "Urgent",
    targetAudience: "CSE-3A",
    priority: "High",
    publishDate: "2026-09-27",
    content: "Due to campus network maintenance on Thursday, the submission window has been extended to Sunday midnight.",
    authorName: "Dr. Arun Kumar",
    pinned: true
  }
];

module.exports = { noticesData };
