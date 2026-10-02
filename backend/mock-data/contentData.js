const contentData = [
  {
    id: "CNT001",
    facultyId: "FAC001",
    subjectCode: "CS301",
    className: "CSE-3A",
    title: "Binary Search Trees & AVL Trees Lecture Notes",
    topic: "Module 3: Non-Linear Data Structures",
    contentType: "PDF",
    description: "Detailed theoretical analysis, rotation mechanisms, and pseudocode for AVL tree balancing.",
    resourceLink: "/uploads/avl-trees-module3.pdf",
    fileSize: "2.4 MB",
    uploadDate: "2026-09-15",
    tags: ["Trees", "AVL", "Data Structures"]
  },
  {
    id: "CNT002",
    facultyId: "FAC001",
    subjectCode: "CS301",
    className: "CSE-3A",
    title: "Graph Algorithms - Dijkstra and Bellman-Ford Visualizer",
    topic: "Module 4: Graph Algorithms",
    contentType: "External Resource",
    description: "Interactive visualization tool for shortest path computations.",
    resourceLink: "https://visualgo.net/en/sssp",
    fileSize: "Web Link",
    uploadDate: "2026-09-18",
    tags: ["Graphs", "Shortest Path", "Interactive"]
  },
  {
    id: "CNT003",
    facultyId: "FAC001",
    subjectCode: "CS302",
    className: "CSE-3A",
    title: "Relational Algebra & Normalization 1NF to BCNF",
    topic: "Module 2: Relational Model & Schema Refinement",
    contentType: "Presentation",
    description: "Slide deck covering functional dependencies, decomposition algorithms, and losslessness.",
    resourceLink: "/uploads/db-normalization-slides.pptx",
    fileSize: "5.1 MB",
    uploadDate: "2026-09-20",
    tags: ["DBMS", "Normalization", "Slides"]
  },
  {
    id: "CNT004",
    facultyId: "FAC001",
    subjectCode: "CS305",
    className: "IT-3A",
    title: "React Hooks & State Management Guide",
    topic: "Module 2: Frontend Engineering",
    contentType: "Notes",
    description: "Comprehensive notes with code snippets covering useState, useEffect, and custom hooks.",
    resourceLink: "/uploads/react-hooks-guide.pdf",
    fileSize: "1.8 MB",
    uploadDate: "2026-09-22",
    tags: ["React", "JavaScript", "Frontend"]
  },
  {
    id: "CNT005",
    facultyId: "FAC001",
    subjectCode: "CS305",
    className: "IT-3A",
    title: "RESTful API Design & Express.js Video Walkthrough",
    topic: "Module 3: Server-side Architecture",
    contentType: "Video",
    description: "Recorded laboratory session demonstrating controller-service-repository patterns.",
    resourceLink: "https://streaming.college.edu/lectures/express-patterns.mp4",
    fileSize: "145 MB",
    uploadDate: "2026-09-25",
    tags: ["Express", "Backend", "Video"]
  }
];

module.exports = { contentData };
