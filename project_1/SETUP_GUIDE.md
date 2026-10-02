# Project Setup & Execution Guide

Welcome to the **Student Management System (SMS) — AI Debugging Training Project**.

This guide provides complete, beginner-friendly, step-by-step instructions to set up, run, and verify the full application on your local machine.

---

## 1. Zero External Database Required (No SQL Database Needed)

> **IMPORTANT**: This project is engineered with a **zero-configuration pure Java in-memory data store**. You do **NOT** need to install MySQL, Docker, PostgreSQL, or any SQL database server.
> 
> Everything runs completely self-contained in memory using thread-safe Java repositories (`ConcurrentHashMap`). Realistic seed records (25 enrolled students and faculty accounts) are initialized automatically upon application startup.

---

## 2. Prerequisites

Ensure the following tools are available on your system:

| Tool | Recommended Version | Check Command |
|---|---|---|
| **Java Development Kit (JDK)** | OpenJDK 21 LTS or newer | `java -version` |
| **Apache Maven** | 3.8.x or newer | `mvn -version` |
| **Node.js** | Node 18 LTS or 20 LTS | `node -version` |
| **npm** | 9.x or 10.x | `npm -version` |

---

## 3. Step-by-Step Setup

### Step 3.1: Start the Backend Server

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd "project 1/backend"
   ```

2. Build and launch the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```

3. **Verify Backend Status**:
   - The terminal will display the Spring Boot banner:
     ```
       .   ____          _            __ _ _
      /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
     ( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
      \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
       '  |____| .__|_| |_|_| |_\__, | / / / /
      =========|_|==============|___/=/_/_/_/
      :: Spring Boot ::                (v3.3.4)
     ```
   - The server will listen on **`http://localhost:8080`**.
   - Test that the backend is responding by running in another terminal:
     ```bash
     curl http://localhost:8080/api/dashboard/stats
     ```
     *(Returns JSON metrics for the 25 pre-seeded students).*

---

### Step 3.2: Start the Frontend Application

1. Open a **second terminal** and navigate to the `frontend` folder:
   ```bash
   cd "project 1/frontend"
   ```

2. Install the necessary JavaScript dependencies (only needed the first time):
   ```bash
   npm install
   ```

3. Launch the Vite development web server:
   ```bash
   npm run dev
   ```

4. **Verify Frontend Status**:
   - The terminal will output:
     ```
       VITE v5.4.21  ready in 250 ms

       ➜  Local:   http://localhost:5173/
       ➜  Network: use --host to expose
     ```
   - Open your web browser and navigate to **`http://localhost:5173`**.

---

## 4. Default Login Credentials

The system comes pre-seeded with two user roles:

| Username | Password | Role | Permissions |
|---|---|---|---|
| `admin` | `Admin@123` | `ADMIN` | Full System Access: View, Add, Edit, Delete Students, View Dashboard |
| `teacher` | `Teacher@123` | `TEACHER` | Academic Faculty: View, Add, Edit Students, View Dashboard |
| `teacher2` | `Teacher@456` | `TEACHER` | Secondary Faculty Account |

> **Pro-Tip**: On the login page (`http://localhost:5173/login`), click the **Admin** or **Teacher** chip at the bottom of the card to instantly autofill credentials!

---

## 5. Application Features & How to Navigate

### 1. Dashboard (`/dashboard`)
- **KPI Stat Cards**: Real-time totals for Students, Average Marks, Average Attendance, Passed Count, and Failed Count.
- **Department Distribution**: Interactive breakdown showing enrollment share across *Computer Science, IT, Electronics, Mechanical, and Civil*.

### 2. Student Directory (`/students`)
- **Search Bar**: Live search by student name, Student ID (`STU1001`), or email.
- **Multi-criteria Filters**: Filter by Department, Academic Year (1 to 4), and Pass/Fail status.
- **Data Table**: Displays student ID, full name, email, department, year, marks, attendance progress, grade badge, and pass/fail pill.
- **Pagination**: Navigate between pages using numeric buttons or Previous/Next arrows.
- **Actions**:
  - 👁️ **View Details**: Opens an academic report modal with full profile, attendance gauge, and contact details.
  - ✏️ **Edit Student**: Modify student details and academic marks.
  - 🗑️ **Delete Student** *(Admin only)*: Prompts confirmation modal before removing a student.
- **Register New Student**: Add new enrollments with full form validation.

### 3. In-Memory Thread-Safe Data Store
The application uses pure Java `ConcurrentHashMap` repositories. All operations (creates, updates, deletes, searches, and filters) are fast, reliable, and completely contained in RAM without requiring any SQL daemon or database connection.

---

## 6. How to Build & Verify Frontend

### Test Frontend Production Build
To verify that the React frontend compiles cleanly for production:
```bash
cd "project 1/frontend"
npm run build
```

### Instructor Verification Suite (Optional)
Instructor bug verification tests and answer keys are located in the `instructor/` folder:
- [`instructor/ANSWER_KEY.md`](file:///home/dell/project%201/instructor/ANSWER_KEY.md)
- [`instructor/tests/InstructorBugVerificationTests.java`](file:///home/dell/project%201/instructor/tests/InstructorBugVerificationTests.java)

---

## 7. Troubleshooting & FAQ

### Port 8080 is already in use
If another process is running on port 8080:
- Stop the conflicting process, or
- Pass a different port when launching Spring Boot:
  ```bash
  mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"
  ```
  *(If changing backend port, update the proxy in `frontend/vite.config.js`).*

### Port 5173 is already in use
Vite will automatically offer to run on the next free port (e.g. `5174`). Follow the terminal prompt.

### How to Reset Data
Because the database runs in-memory, simply stopping the backend (`Ctrl+C`) and restarting it (`mvn spring-boot:run`) instantly resets all student records, users, and stats back to the original clean training state.
