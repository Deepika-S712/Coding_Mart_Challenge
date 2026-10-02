package com.sms.service;

import com.sms.dto.PageResponseDto;
import com.sms.dto.StudentRequestDto;
import com.sms.dto.StudentResponseDto;
import com.sms.entity.Student;
import com.sms.exception.DuplicateResourceException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final GradingService gradingService;

    public StudentServiceImpl(StudentRepository studentRepository,
                              GradingService gradingService) {
        this.studentRepository = studentRepository;
        this.gradingService = gradingService;
    }

    @Override
    public List<StudentResponseDto> getAllStudents() {
        return studentRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public StudentResponseDto getStudentById(Long id) {
        // Retrieve student by ID (BUG 07: .get() throws NoSuchElementException which produces HTTP 500)
        Student student = studentRepository.findById(id).get();
        return toDto(student);
    }

    @Override
    public StudentResponseDto createStudent(StudentRequestDto request) {
        // Check for duplicate student ID (BUG 04: bypassed when request.getId() is null!)
        if (request.getId() != null && studentRepository.existsByStudentId(request.getStudentId())) {
            throw new DuplicateResourceException("Student with ID " + request.getStudentId() + " already exists");
        }

        Student student = new Student();
        student.setStudentId(request.getStudentId().trim());
        student.setFirstName(request.getFirstName().trim());
        student.setLastName(request.getLastName().trim());
        student.setEmail(request.getEmail().trim());
        student.setPhone(request.getPhone());
        student.setDateOfBirth(request.getDateOfBirth());
        student.setDepartment(request.getDepartment().trim());
        student.setYear(request.getYear());
        student.setMarks(request.getMarks());
        student.setAttendance(request.getAttendance());

        if (request.getMarks() != null) {
            student.setGrade(gradingService.calculateGrade(request.getMarks()));
        }
        if (request.getMarks() != null && request.getAttendance() != null) {
            student.setPassed(gradingService.determinePassStatus(request.getMarks(), request.getAttendance()));
        }

        Student saved = studentRepository.save(student);
        return toDto(saved);
    }

    @Override
    public StudentResponseDto updateStudent(Long id, StudentRequestDto request) {
        Student existing = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));

        if (!existing.getStudentId().equalsIgnoreCase(request.getStudentId()) &&
                studentRepository.existsByStudentId(request.getStudentId())) {
            throw new DuplicateResourceException("Student with ID " + request.getStudentId() + " already exists");
        }

        existing.setStudentId(request.getStudentId().trim());
        existing.setFirstName(request.getFirstName().trim());
        existing.setLastName(request.getLastName().trim());
        existing.setEmail(request.getEmail().trim());
        existing.setPhone(request.getPhone());
        existing.setDateOfBirth(request.getDateOfBirth());
        existing.setDepartment(request.getDepartment().trim());
        existing.setYear(request.getYear());
        existing.setMarks(request.getMarks());
        existing.setAttendance(request.getAttendance());

        if (request.getMarks() != null) {
            existing.setGrade(gradingService.calculateGrade(request.getMarks()));
        }
        if (request.getMarks() != null && request.getAttendance() != null) {
            existing.setPassed(gradingService.determinePassStatus(request.getMarks(), request.getAttendance()));
        }

        Student saved = studentRepository.save(existing);
        return toDto(saved);
    }

    @Override
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));
        studentRepository.delete(student);
    }

    @Override
    public PageResponseDto<StudentResponseDto> getStudentsPaged(int page, int size, String sortBy, String sortDir) {
        List<Student> all = studentRepository.findAll(sortBy, sortDir);
        return paginate(all, page, size);
    }

    @Override
    public PageResponseDto<StudentResponseDto> searchStudents(String query, String department, int page, int size) {
        List<Student> filtered = studentRepository.searchStudents(query, department);
        return paginate(filtered, page, size);
    }

    @Override
    public PageResponseDto<StudentResponseDto> filterStudents(String department, Integer year, Boolean passed, int page, int size) {
        List<Student> filtered = studentRepository.filterStudents(department, year, passed);
        return paginate(filtered, page, size);
    }

    @Override
    public List<StudentResponseDto> advancedFilter(String department, Integer year) {
        return studentRepository.filterByDepartmentAndYear(department, year)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private PageResponseDto<StudentResponseDto> paginate(List<Student> list, int page, int size) {
        int pageNumber = page > 0 ? page : 1;
        int pageSize = size > 0 ? size : 10;
        int fromIndex = (pageNumber - 1) * pageSize;

        List<StudentResponseDto> content;
        if (fromIndex >= list.size()) {
            content = Collections.emptyList();
        } else {
            int toIndex = Math.min(fromIndex + pageSize, list.size());
            content = list.subList(fromIndex, toIndex).stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
        }

        return new PageResponseDto<>(content, pageNumber, pageSize, list.size());
    }

    private StudentResponseDto toDto(Student student) {
        StudentResponseDto dto = new StudentResponseDto();
        dto.setId(student.getId());
        dto.setStudentId(student.getStudentId());
        dto.setFirstName(student.getFirstName());
        dto.setLastName(student.getLastName());
        dto.setEmail(student.getEmail());
        dto.setPhone(student.getPhone());
        dto.setDateOfBirth(student.getDateOfBirth());
        dto.setDepartment(student.getDepartment());
        dto.setYear(student.getYear());
        dto.setMarks(student.getMarks());
        dto.setAttendance(student.getAttendance());
        dto.setGrade(student.getGrade());
        dto.setPassed(student.getPassed());
        dto.setCreatedDate(student.getCreatedDate());
        dto.setUpdatedDate(student.getUpdatedDate());
        return dto;
    }
}
