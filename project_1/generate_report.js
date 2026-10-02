const fs = require('fs');
const path = require('path');
const { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  Table, 
  TableRow, 
  TableCell, 
  BorderStyle, 
  WidthType, 
  AlignmentType,
  ShadingType
} = require('docx');

const bugsData = [
  {
    id: "BUG-01",
    title: "Login Authentication Bypass for Temporary Accounts",
    layer: "Backend Authentication / Spring Security",
    file: "backend/src/main/java/com/sms/service/AuthService.java",
    severity: "Critical / Security Vulnerability",
    steps: [
      "1. Start the Spring Boot backend server on port 8080.",
      "2. Send an authentication request to POST /api/auth/login or visit http://localhost:5173/login.",
      "3. Enter username: 'teacher'.",
      "4. Enter an incorrect password (e.g., 'CompletelyWrongPassword123!').",
      "5. Click 'Sign In' or submit the JSON payload."
    ],
    expected: "HTTP 401 Unauthorized with error message 'Invalid username or password'. The system must reject all invalid passwords.",
    actual: "HTTP 200 OK. The backend accepts any non-empty password for flagged accounts and returns a signed JWT token granting teacher privileges.",
    evidence: `$body = @{ username = "teacher"; password = "CompletelyWrongPassword123!" } | ConvertTo-Json\nInvoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $body -ContentType "application/json"\n\nResponse:\n{\n  "token": "eyJhbGciOiJIUzUxMiJ9...",\n  "username": "teacher",\n  "fullName": "Prof. Sarah Jenkins",\n  "role": "TEACHER"\n}`,
    rootCause: "In AuthService.java (lines 31-38), when passwordEncoder.matches(...) returns false, the code checks:\nif (!user.isTemporaryPassword() || request.getPassword().isEmpty())\nFor temporary accounts (like 'teacher'), user.isTemporaryPassword() is true, making !user.isTemporaryPassword() false. When any password string is typed, request.getPassword().isEmpty() is also false. Thus (false || false) evaluates to false, completely skipping the BadCredentialsException throw and issuing a valid JWT token.",
    proposedFix: "Remove the flawed boolean bypass condition. Unconditionally throw BadCredentialsException whenever passwordEncoder.matches() returns false.",
    diff: `--- a/backend/src/main/java/com/sms/service/AuthService.java\n+++ b/backend/src/main/java/com/sms/service/AuthService.java\n@@ -30,9 +30,5 @@ public class AuthService {\n         boolean matches = passwordEncoder.matches(request.getPassword(), user.getPassword());\n \n         if (!matches) {\n-            // Check temporary password policy for newly provisioned staff accounts\n-            if (!user.isTemporaryPassword() || request.getPassword().isEmpty()) {\n-                throw new BadCredentialsException("Invalid username or password");\n-            }\n+            throw new BadCredentialsException("Invalid username or password");\n         }`,
    testPerformed: "Executed POST /api/auth/login with username 'teacher' and invalid password 'WrongPassword123!'. Verified HTTP 401 Unauthorized response is returned. Re-tested with valid credentials ('teacher' / 'Teacher@123') and verified login succeeds.",
    testResult: "PASS - HTTP 401 Unauthorized returned for wrong password; HTTP 200 OK returned for valid password.",
    learned: "Authentication routines must follow fail-closed security design. Complex boolean branching inside credential validation can inadvertently bypass access control checks."
  },
  {
    id: "BUG-02",
    title: "Case-Sensitive Email Prefix Search Mismatch",
    layer: "Backend Repository / Data Access",
    file: "backend/src/main/java/com/sms/repository/InMemoryStudentRepository.java",
    severity: "Medium / Usability & Search Failure",
    steps: [
      "1. Log into the application as admin or teacher.",
      "2. Go to the Students page (or call GET /api/students/search?query=dundermifflin.edu).",
      "3. Search for email domain 'dundermifflin.edu' or 'university.edu'.",
      "4. Observe that 0 students are returned, even though Michael Scott has email 'michael.scott@dundermifflin.edu'.",
      "5. Search with uppercase 'ALICE.JOHNSON' and observe that 0 students are returned."
    ],
    expected: "Email search should be case-insensitive and match substrings anywhere in the email (domain, username, suffix), returning matching student records.",
    actual: "Search returns 0 results because it uses case-sensitive prefix matching (startsWith) instead of case-insensitive substring contains.",
    evidence: `Invoke-RestMethod -Uri "http://localhost:8080/api/students/search?query=dundermifflin.edu" -Headers @{ Authorization = "Bearer $token" }\n\nResponse:\n{\n  "content": [],\n  "pageNumber": 1,\n  "pageSize": 10,\n  "totalElements": 0,\n  "totalPages": 0\n}`,
    rootCause: "In InMemoryStudentRepository.java (line 96), the email search predicate is:\nboolean em = s.getEmail() != null && s.getEmail().startsWith(query);\nThis has two flaws:\n1. It uses startsWith(query) instead of contains(), so searches for email domains (e.g. '@dundermifflin.edu') or internal substrings fail.\n2. It evaluates query directly without converting both email and query to lowercase, causing all uppercase/mixed-case searches to fail.",
    proposedFix: "Change s.getEmail().startsWith(query) to s.getEmail().toLowerCase().contains(qLower) to provide consistent, case-insensitive substring matching across the entire email address.",
    diff: `--- a/backend/src/main/java/com/sms/repository/InMemoryStudentRepository.java\n+++ b/backend/src/main/java/com/sms/repository/InMemoryStudentRepository.java\n@@ -93,4 +93,3 @@\n-                        // BUG 02: Case-Sensitive Email Prefix Search Mismatch\n-                        // Uses case-sensitive startsWith instead of case-insensitive substring contains\n-                        boolean em = s.getEmail() != null && s.getEmail().startsWith(query);\n+                        boolean em = s.getEmail() != null && s.getEmail().toLowerCase().contains(qLower);`,
    testPerformed: "Queried GET /api/students/search?query=dundermifflin.edu and GET /api/students/search?query=ALICE.JOHNSON with valid auth token.",
    testResult: "PASS - Query for 'dundermifflin.edu' successfully returns Michael Scott; uppercase query 'ALICE.JOHNSON' returns Alice Johnson.",
    learned: "Search functionality across text attributes must always normalize character casing using toLowerCase() and employ substring matching (contains / LIKE %query%) unless strict prefixing is explicitly required by specification."
  }
];

function createSectionForBug(bug) {
  const children = [];

  // Bug Title
  children.push(new Paragraph({
    text: `${bug.id}: ${bug.title}`,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 300, after: 150 }
  }));

  // Overview Table
  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Bug ID", bold: true })] })] }),
          new TableCell({ width: { size: 75, type: WidthType.PERCENTAGE }, children: [new Paragraph(bug.id)] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Severity", bold: true })] })] }),
          new TableCell({ children: [new Paragraph(bug.severity)] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Layer", bold: true })] })] }),
          new TableCell({ children: [new Paragraph(bug.layer)] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Primary File", bold: true })] })] }),
          new TableCell({ children: [new Paragraph(bug.file)] })
        ]
      })
    ]
  });
  children.push(table);
  children.push(new Paragraph({ text: "", spacing: { after: 150 } }));

  // Steps to Reproduce
  children.push(new Paragraph({
    children: [new TextRun({ text: "Steps to Reproduce:", bold: true, size: 24 })],
    spacing: { before: 150, after: 80 }
  }));
  bug.steps.forEach(step => {
    children.push(new Paragraph({ text: step, spacing: { after: 40 } }));
  });

  // Expected vs Actual
  children.push(new Paragraph({
    children: [
      new TextRun({ text: "Expected Behavior: ", bold: true }),
      new TextRun(bug.expected)
    ],
    spacing: { before: 100, after: 60 }
  }));
  children.push(new Paragraph({
    children: [
      new TextRun({ text: "Actual Behavior: ", bold: true }),
      new TextRun(bug.actual)
    ],
    spacing: { after: 120 }
  }));

  // Evidence
  children.push(new Paragraph({
    children: [new TextRun({ text: "Evidence & Logs:", bold: true, size: 24 })],
    spacing: { before: 100, after: 60 }
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: bug.evidence, font: "Consolas", size: 18 })],
    shading: { type: ShadingType.CLEAR, fill: "F3F4F6" },
    spacing: { after: 120 }
  }));

  // Root Cause
  children.push(new Paragraph({
    children: [new TextRun({ text: "Root Cause Analysis:", bold: true, size: 24 })],
    spacing: { before: 100, after: 60 }
  }));
  children.push(new Paragraph({
    children: [new TextRun(bug.rootCause)],
    spacing: { after: 120 }
  }));

  // Proposed Fix
  children.push(new Paragraph({
    children: [new TextRun({ text: "Proposed Resolution:", bold: true, size: 24 })],
    spacing: { before: 100, after: 60 }
  }));
  children.push(new Paragraph({
    children: [new TextRun(bug.proposedFix)],
    spacing: { after: 120 }
  }));

  // Code Diff
  children.push(new Paragraph({
    children: [new TextRun({ text: "Code Modifications (Unified Diff):", bold: true, size: 24 })],
    spacing: { before: 100, after: 60 }
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: bug.diff, font: "Consolas", size: 18 })],
    shading: { type: ShadingType.CLEAR, fill: "F3F4F6" },
    spacing: { after: 120 }
  }));

  // Test Performed & Result
  children.push(new Paragraph({
    children: [
      new TextRun({ text: "Test Performed: ", bold: true }),
      new TextRun(bug.testPerformed)
    ],
    spacing: { before: 80, after: 60 }
  }));
  children.push(new Paragraph({
    children: [
      new TextRun({ text: "Verification Result: ", bold: true }),
      new TextRun({ text: bug.testResult, bold: true, color: "16A34A" })
    ],
    spacing: { after: 80 }
  }));

  // Lessons Learned
  children.push(new Paragraph({
    children: [
      new TextRun({ text: "What I Learned: ", bold: true }),
      new TextRun(bug.learned)
    ],
    spacing: { before: 80, after: 200 }
  }));

  return children;
}

async function buildDoc() {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "Student Management System (SMS)",
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 }
        }),
        new Paragraph({
          children: [new TextRun({ text: "Defect Investigation & AI-Assisted Debugging Report", bold: true, size: 28, color: "2563EB" })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 }
        }),
        new Paragraph({
          text: "This document contains a comprehensive record of all identified bugs, root-cause analyses, reproduction steps, code resolutions, and verification test outcomes across the Student Management System application.",
          spacing: { after: 300 }
        }),
        ...bugsData.flatMap(b => createSectionForBug(b))
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(__dirname, 'Student_Management_System_Bug_Report.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log("Successfully generated Word report at: " + outputPath);
}

buildDoc().catch(err => console.error(err));
