package com.sms.repository;

import com.sms.entity.Student;
import java.util.List;

public interface StudentCustomRepository {
    List<Student> filterByDepartmentAndYear(String department, Integer year);
}
