package com.sms.service;

import com.sms.dto.PageResponseDto;
import com.sms.dto.StudentRequestDto;
import com.sms.dto.StudentResponseDto;

import java.util.List;

public interface StudentService {

    List<StudentResponseDto> getAllStudents();

    StudentResponseDto getStudentById(Long id);

    StudentResponseDto createStudent(StudentRequestDto request);

    StudentResponseDto updateStudent(Long id, StudentRequestDto request);

    void deleteStudent(Long id);

    PageResponseDto<StudentResponseDto> getStudentsPaged(int page, int size, String sortBy, String sortDir);

    PageResponseDto<StudentResponseDto> searchStudents(String query, String department, int page, int size);

    PageResponseDto<StudentResponseDto> filterStudents(String department, Integer year, Boolean passed, int page, int size);

    List<StudentResponseDto> advancedFilter(String department, Integer year);
}
