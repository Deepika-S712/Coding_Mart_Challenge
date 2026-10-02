package com.sms.service;

import com.sms.dto.DashboardStatsDto;
import com.sms.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final StudentRepository studentRepository;

    public DashboardService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public DashboardStatsDto getDashboardStats() {
        long totalStudents = studentRepository.count();
        Double avgMarks = studentRepository.getAverageMarks();
        Double avgAttendance = studentRepository.getAverageAttendance();
        long passedCount = studentRepository.countByPassedTrue();
        long failedCount = studentRepository.countByPassedFalse();

        double roundedMarks = avgMarks != null ?
                BigDecimal.valueOf(avgMarks).setScale(1, RoundingMode.HALF_UP).doubleValue() : 0.0;
        double roundedAttendance = avgAttendance != null ?
                BigDecimal.valueOf(avgAttendance).setScale(1, RoundingMode.HALF_UP).doubleValue() : 0.0;

        Map<String, Long> departmentCounts = new HashMap<>();
        List<Object[]> deptResults = studentRepository.countStudentsByDepartment();
        for (Object[] row : deptResults) {
            String dept = (String) row[0];
            Long count = (Long) row[1];
            departmentCounts.put(dept, count);
        }

        return new DashboardStatsDto(
                totalStudents,
                roundedMarks,
                roundedAttendance,
                passedCount,
                failedCount,
                departmentCounts
        );
    }
}
