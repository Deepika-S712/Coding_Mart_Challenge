package com.sms.config;

import com.sms.entity.Role;
import com.sms.entity.Student;
import com.sms.entity.User;
import com.sms.repository.StudentRepository;
import com.sms.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           StudentRepository studentRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedStudents();
    }

    public void seedUsers() {
        if (userRepository.count() == 0) {
            userRepository.save(new User(1L, "admin", passwordEncoder.encode("Admin@123"), "System Administrator", Role.ADMIN, false));
            userRepository.save(new User(2L, "teacher", passwordEncoder.encode("Teacher@123"), "Prof. Sarah Jenkins", Role.TEACHER, true));
            userRepository.save(new User(3L, "teacher2", passwordEncoder.encode("Teacher@123"), "Prof. David Clark", Role.TEACHER, false));
        }
    }

    public void seedStudents() {
        if (studentRepository.count() == 0) {
            createStudent(1L, "STU1001", "Alice", "Johnson", "alice.johnson@university.edu", "+1-555-0101", LocalDate.of(2003, 5, 14), "Computer Science", 3, 92.5, 96.0, "A+", true);
            createStudent(2L, "STU1002", "Bob", "Smith", "bob.smith@university.edu", "+1-555-0102", LocalDate.of(2002, 11, 20), "Computer Science", 4, 84.0, 91.0, "A", true);
            createStudent(3L, "STU1003", "Charlie", "Brown", "charlie.brown@university.edu", "+1-555-0103", LocalDate.of(2004, 2, 18), "Information Technology", 2, 70.0, 82.0, "C", true);
            createStudent(4L, "STU1004", "Diana", "Prince", "diana.prince@university.edu", "+1-555-0104", LocalDate.of(2003, 8, 9), "Electronics", 3, 65.5, 78.0, "C", true);
            createStudent(5L, "STU1005", "Ethan", "Hunt", "ethan.hunt@university.edu", "+1-555-0105", LocalDate.of(2001, 12, 3), "Mechanical", 4, 54.0, 68.0, "D", false);
            createStudent(6L, "STU1006", "Fiona", "Gallagher", "fiona.g@university.edu", "+1-555-0106", LocalDate.of(2004, 7, 22), "Civil", 1, 42.0, 80.0, "D", true);
            createStudent(7L, "STU1007", "George", "Clark", "george.clark@university.edu", "+1-555-0107", LocalDate.of(2003, 3, 30), "Computer Science", 3, 38.0, 55.0, "F", false);
            createStudent(8L, "STU1008", "Hannah", "Abbott", "hannah.a@university.edu", "+1-555-0108", LocalDate.of(2004, 10, 15), "Information Technology", 2, 88.0, 94.0, "A", true);
            createStudent(9L, "STU1009", "Ian", "Malcolm", "ian.malcolm@university.edu", "+1-555-0109", LocalDate.of(2002, 6, 11), "Electronics", 4, 76.5, 85.0, "B", true);
            createStudent(10L, "STU1010", "Julia", "Roberts", "julia.r@university.edu", "+1-555-0110", LocalDate.of(2005, 1, 25), "Computer Science", 1, 95.0, 98.0, "A+", true);
            createStudent(11L, "STU1011", "Kevin", "Bacon", "kevin.bacon@university.edu", "+1-555-0111", LocalDate.of(2003, 9, 17), "Mechanical", 3, 62.0, 74.0, "C", false);
            createStudent(12L, "STU1012", "Laura", "Croft", "laura.croft@university.edu", "+1-555-0112", LocalDate.of(2002, 4, 4), "Civil", 4, 81.0, 89.0, "A", true);
            createStudent(13L, "STU1013", "Michael", "Scott", "michael.scott@dundermifflin.edu", "+1-555-0113", LocalDate.of(2001, 3, 15), "Information Technology", 4, 35.0, 85.0, "F", true);
            createStudent(14L, "STU1014", "Nancy", "Wheeler", "nancy.w@university.edu", "+1-555-0114", LocalDate.of(2004, 11, 8), "Computer Science", 2, 89.5, 93.0, "A", true);
            createStudent(15L, "STU1015", "Oscar", "Martinez", "oscar.m@university.edu", "+1-555-0115", LocalDate.of(2003, 7, 2), "Electronics", 3, 91.0, 92.0, "A+", true);
            createStudent(16L, "STU1016", "Pam", "Beesly", "pam.beesly@university.edu", "+1-555-0116", LocalDate.of(2004, 3, 25), "Civil", 2, 73.0, 86.0, "B", true);
            createStudent(17L, "STU1017", "Quinn", "Fabray", "quinn.f@university.edu", "+1-555-0117", LocalDate.of(2005, 8, 19), "Computer Science", 1, 87.0, 90.0, "A", true);
            createStudent(18L, "STU1018", "Ryan", "Howard", "ryan.howard@university.edu", "+1-555-0118", LocalDate.of(2002, 5, 5), "Mechanical", 4, 48.0, 52.0, "F", false);
            createStudent(19L, "STU1019", "Sophia", "Loren", "sophia.loren@university.edu", "+1-555-0119", LocalDate.of(2003, 12, 12), "Information Technology", 3, 94.0, 97.0, "A+", true);
            createStudent(20L, "STU1020", "Thomas", "Shelby", "thomas.shelby@university.edu", "+1-555-0120", LocalDate.of(2002, 8, 23), "Civil", 4, 78.5, 81.0, "B", true);
            createStudent(21L, "STU1021", "Uma", "Thurman", "uma.thurman@university.edu", "+1-555-0121", LocalDate.of(2004, 4, 29), "Electronics", 2, 83.0, 88.0, "A", true);
            createStudent(22L, "STU1022", "Victor", "Frankenstein", "victor.f@university.edu", "+1-555-0122", LocalDate.of(2001, 11, 14), "Mechanical", 4, 98.0, 99.0, "A+", true);
            createStudent(23L, "STU1023", "Wendy", "Darling", "wendy.d@university.edu", "+1-555-0123", LocalDate.of(2005, 2, 14), "Computer Science", 1, 71.5, 84.0, "B", true);
            createStudent(24L, "STU1024", "Xavier", "Charles", "xavier.c@university.edu", "+1-555-0124", LocalDate.of(2003, 10, 10), "Information Technology", 3, 96.0, 95.0, "A+", true);
            createStudent(25L, "STU1025", "Yvonne", "Strahovski", "yvonne.s@university.edu", "+1-555-0125", LocalDate.of(2004, 6, 30), "Civil", 2, 69.0, 77.0, "C", true);
        }
    }

    private void createStudent(Long id, String studentId, String firstName, String lastName,
                               String email, String phone, LocalDate dob, String department,
                               Integer year, Double marks, Double attendance, String grade, Boolean passed) {
        Student s = new Student();
        s.setId(id);
        s.setStudentId(studentId);
        s.setFirstName(firstName);
        s.setLastName(lastName);
        s.setEmail(email);
        s.setPhone(phone);
        s.setDateOfBirth(dob);
        s.setDepartment(department);
        s.setYear(year);
        s.setMarks(marks);
        s.setAttendance(attendance);
        s.setGrade(grade);
        s.setPassed(passed);
        studentRepository.save(s);
    }
}
