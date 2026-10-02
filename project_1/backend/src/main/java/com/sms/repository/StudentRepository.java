package com.sms.repository;

import com.sms.entity.Student;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends StudentCustomRepository {

    Optional<Student> findById(Long id);

    Optional<Student> findByStudentId(String studentId);

    boolean existsByStudentId(String studentId);

    Student save(Student student);

    void delete(Student student);

    void deleteById(Long id);

    List<Student> findAll();

    List<Student> findAll(String sortBy, String sortDir);

    List<Student> searchStudents(String query, String department);

    List<Student> filterStudents(String department, Integer year, Boolean passed);

    long count();

    long countByPassedTrue();

    long countByPassedFalse();

    Double getAverageMarks();

    Double getAverageAttendance();

    List<Object[]> countStudentsByDepartment();

    void deleteAll();
}
