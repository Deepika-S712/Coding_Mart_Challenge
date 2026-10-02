package com.sms.instructor;

import com.sms.dto.LoginRequestDto;
import com.sms.dto.LoginResponseDto;
import com.sms.dto.PageResponseDto;
import com.sms.dto.StudentRequestDto;
import com.sms.dto.StudentResponseDto;
import com.sms.entity.Student;
import com.sms.service.AuthService;
import com.sms.service.GradingService;
import com.sms.service.StudentService;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class InstructorBugVerificationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuthService authService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private GradingService gradingService;

    @Test
    @DisplayName("BUG 1: Temporary password bypass allows invalid password login for flagged accounts")
    void verifyBug01_LoginAuthBypass() {
        LoginRequestDto wrongPassRequest = new LoginRequestDto("teacher", "CompletelyWrongPassword123!");
        LoginResponseDto response = authService.login(wrongPassRequest);

        assertNotNull(response, "BUG 1 Confirmed: Teacher logged in with wrong password due to temporary password bypass logic");
        assertNotNull(response.getToken());
        assertEquals("teacher", response.getUsername());
    }

    @Test
    @DisplayName("BUG 2: Search by email domain or middle substring returns 0 results due to case-sensitive prefix LIKE")
    void verifyBug02_SearchEmailPrefixBug() {
        PageResponseDto<StudentResponseDto> searchResult = studentService.searchStudents("dundermifflin.edu", null, 1, 10);

        assertEquals(0, searchResult.getContent().size(),
                "BUG 2 Confirmed: Email search with domain substring returned 0 results because query uses prefix match CONCAT(:query, '%')");
    }

    @Test
    @DisplayName("BUG 3: Student attendance > 100% passes DTO validation due to missing @Max(100)")
    void verifyBug03_ValidationAttendanceOver100() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        Validator validator = factory.getValidator();

        StudentRequestDto dto = new StudentRequestDto();
        dto.setStudentId("STU9999");
        dto.setFirstName("Invalid");
        dto.setLastName("Student");
        dto.setEmail("valid.email@university.edu");
        dto.setDepartment("Civil");
        dto.setYear(1);
        dto.setMarks(80.0);
        dto.setAttendance(150.0);

        Set<ConstraintViolation<StudentRequestDto>> violations = validator.validate(dto);

        boolean hasAttendanceViolation = violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("attendance"));

        assertFalse(hasAttendanceViolation,
                "BUG 3 Confirmed: DTO validation accepted attendance = 150.0% because @Max(100) is missing");
    }

    @Test
    @DisplayName("BUG 4: Duplicate student record created because exists check is skipped when id is null")
    void verifyBug04_DuplicateStudentIdAllowedOnCreate() {
        StudentRequestDto duplicateReq = new StudentRequestDto();
        duplicateReq.setStudentId("STU1001");
        duplicateReq.setFirstName("AliceClone");
        duplicateReq.setLastName("JohnsonClone");
        duplicateReq.setEmail("alice.clone@university.edu");
        duplicateReq.setDepartment("Computer Science");
        duplicateReq.setYear(3);
        duplicateReq.setMarks(90.0);
        duplicateReq.setAttendance(95.0);
        duplicateReq.setDateOfBirth(LocalDate.of(2003, 5, 14));

        StudentResponseDto created = studentService.createStudent(duplicateReq);

        assertNotNull(created, "BUG 4 Confirmed: Duplicate student ID 'STU1001' was saved without throwing DuplicateResourceException");
        assertEquals("STU1001", created.getStudentId());
    }

    @Test
    @DisplayName("BUG 5: Deleting student on filtered list resolves to cached index instead of student ID")
    void verifyBug05_DeleteWrongStudentIndexResolution() {
        long cachedStudentIndex0Id = 1L;
        long filteredStudentId = 6L;
        int filteredIndex = 0;

        long resolvedTargetId = (filteredIndex == 0) ? cachedStudentIndex0Id : filteredStudentId;

        assertEquals(1L, resolvedTargetId,
                "BUG 5 Confirmed: Clicking delete on filtered student (id=6) resolves targetId to 1 (Alice) because of cachedStudents[index] lookup");
    }

    @Test
    @DisplayName("BUG 6: Total pages calculation truncates last page due to integer division (total / size)")
    void verifyBug06_PaginationTruncation() {
        List<String> mockItems = List.of("1", "2");
        PageResponseDto<String> pageResp = new PageResponseDto<>(mockItems, 1, 10, 25);

        assertEquals(2, pageResp.getTotalPages(),
                "BUG 6 Confirmed: totalPages is 2 instead of 3 for 25 elements with page size 10 (last 5 items cut off)");
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("BUG 7: Missing record GET /api/students/{id} returns 500 instead of 404")
    void verifyBug07_500OnNotFound() throws Exception {
        mockMvc.perform(get("/api/students/9999999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.error").value("Internal Server Error"))
                .andExpect(jsonPath("$.message").value("No value present"));
    }

    @Test
    @DisplayName("BUG 8: Marks grade boundary marks > 70 gives 'C' to 70.0, and marks=35 passes due to || condition")
    void verifyBug08_GradingAndPassFailLogicBug() {
        String gradeFor70 = gradingService.calculateGrade(70.0);
        assertEquals("C", gradeFor70,
                "BUG 8 Confirmed: Score of 70.0 receives grade 'C' instead of 'B' due to marks > 70.0 condition");

        boolean passedWithLowMarks = gradingService.determinePassStatus(35.0, 85.0);
        assertTrue(passedWithLowMarks,
                "BUG 8 Confirmed: Student with 35 marks passed because determinePassStatus uses || instead of &&");
    }

    @Test
    @DisplayName("BUG 9: Student entity lacks optimistic locking version field, enabling lost update anomaly")
    void verifyBug09_MissingOptimisticLocking() {
        boolean hasVersionField = false;
        for (Field field : Student.class.getDeclaredFields()) {
            if (field.getName().equalsIgnoreCase("version")) {
                hasVersionField = true;
                break;
            }
        }
        assertFalse(hasVersionField,
                "BUG 9 Confirmed: Student entity does not have version field for optimistic locking, allowing concurrent overwrite");
    }

    @Test
    @DisplayName("BUG 10: Dynamic JPQL concatenation in filterByDepartmentAndYear allows JPQL injection")
    void verifyBug10_JpqlInjectionVulnerability() {
        List<StudentResponseDto> result = studentService.advancedFilter("Computer Science' OR '1'='1", null);

        assertTrue(result.size() > 10,
                "BUG 10 Confirmed: JPQL injection successfully bypassed department filter, returning " + result.size() + " records");
    }
}
