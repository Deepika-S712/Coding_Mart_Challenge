package com.sms.repository;

import com.sms.entity.Student;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Repository
public class InMemoryStudentRepository implements StudentRepository {

    private final Map<Long, Student> students = new ConcurrentHashMap<>();
    private final AtomicLong idSequence = new AtomicLong(0);

    @Override
    public Optional<Student> findById(Long id) {
        if (id == null) return Optional.empty();
        return Optional.ofNullable(students.get(id));
    }

    @Override
    public Optional<Student> findByStudentId(String studentId) {
        if (studentId == null) return Optional.empty();
        return students.values().stream()
                .filter(s -> studentId.equalsIgnoreCase(s.getStudentId()))
                .findFirst();
    }

    @Override
    public boolean existsByStudentId(String studentId) {
        return findByStudentId(studentId).isPresent();
    }

    @Override
    public Student save(Student student) {
        if (student.getId() == null) {
            student.setId(idSequence.incrementAndGet());
        } else {
            idSequence.updateAndGet(current -> Math.max(current, student.getId()));
        }
        if (student.getCreatedDate() == null) {
            student.setCreatedDate(LocalDateTime.now());
        }
        student.setUpdatedDate(LocalDateTime.now());
        students.put(student.getId(), student);
        return student;
    }

    @Override
    public void delete(Student student) {
        if (student != null && student.getId() != null) {
            students.remove(student.getId());
        }
    }

    @Override
    public void deleteById(Long id) {
        if (id != null) {
            students.remove(id);
        }
    }

    @Override
    public List<Student> findAll() {
        return findAll("id", "asc");
    }

    @Override
    public List<Student> findAll(String sortBy, String sortDir) {
        Comparator<Student> comparator = getComparator(sortBy);
        if ("desc".equalsIgnoreCase(sortDir)) {
            comparator = comparator.reversed();
        }
        return students.values().stream()
                .sorted(comparator)
                .collect(Collectors.toList());
    }

    @Override
    public List<Student> searchStudents(String query, String department) {
        return students.values().stream()
                .filter(s -> {
                    boolean queryMatch;
                    if (query == null || query.trim().isEmpty()) {
                        queryMatch = true;
                    } else {
                        String qLower = query.toLowerCase();
                        boolean fn = s.getFirstName() != null && s.getFirstName().toLowerCase().contains(qLower);
                        boolean ln = s.getLastName() != null && s.getLastName().toLowerCase().contains(qLower);
                        boolean sid = s.getStudentId() != null && s.getStudentId().toLowerCase().contains(qLower);
                        boolean em = s.getEmail() != null && s.getEmail().toLowerCase().contains(qLower);
                        queryMatch = fn || ln || sid || em;
                    }
                    boolean deptMatch = (department == null || department.trim().isEmpty()) ||
                            (s.getDepartment() != null && s.getDepartment().equalsIgnoreCase(department.trim()));
                    return queryMatch && deptMatch;
                })
                .sorted(Comparator.comparing(Student::getId))
                .collect(Collectors.toList());
    }

    @Override
    public List<Student> filterStudents(String department, Integer year, Boolean passed) {
        return students.values().stream()
                .filter(s -> {
                    boolean deptMatch = (department == null || department.trim().isEmpty()) ||
                            (s.getDepartment() != null && s.getDepartment().equalsIgnoreCase(department.trim()));
                    boolean yearMatch = (year == null) || (s.getYear() != null && s.getYear().equals(year));
                    boolean passedMatch = (passed == null) || (s.getPassed() != null && s.getPassed().equals(passed));
                    return deptMatch && yearMatch && passedMatch;
                })
                .sorted(Comparator.comparing(Student::getId))
                .collect(Collectors.toList());
    }

    @Override
    public List<Student> filterByDepartmentAndYear(String department, Integer year) {
        // BUG 10: Dynamic expression evaluation naively evaluates injection tautology
        String expr = (department != null) ? "department = '" + department + "'" : "1=1";
        boolean isTautology = expr.contains("' OR '1'='1") || expr.contains("' OR 1=1") || expr.contains("' OR ''='");

        return students.values().stream()
                .filter(s -> {
                    boolean deptMatch;
                    if (department == null || department.trim().isEmpty()) {
                        deptMatch = true;
                    } else if (isTautology) {
                        deptMatch = true; // Injected expression tautology bypasses department filtering!
                    } else {
                        deptMatch = s.getDepartment() != null && s.getDepartment().equalsIgnoreCase(department.trim());
                    }
                    boolean yearMatch = (year == null) || (s.getYear() != null && s.getYear().equals(year));
                    return deptMatch && yearMatch;
                })
                .sorted(Comparator.comparing(Student::getId))
                .collect(Collectors.toList());
    }

    @Override
    public long count() {
        return students.size();
    }

    @Override
    public long countByPassedTrue() {
        return students.values().stream()
                .filter(s -> Boolean.TRUE.equals(s.getPassed()))
                .count();
    }

    @Override
    public long countByPassedFalse() {
        return students.values().stream()
                .filter(s -> Boolean.FALSE.equals(s.getPassed()))
                .count();
    }

    @Override
    public Double getAverageMarks() {
        return students.values().stream()
                .filter(s -> s.getMarks() != null)
                .mapToDouble(Student::getMarks)
                .average()
                .orElse(0.0);
    }

    @Override
    public Double getAverageAttendance() {
        return students.values().stream()
                .filter(s -> s.getAttendance() != null)
                .mapToDouble(Student::getAttendance)
                .average()
                .orElse(0.0);
    }

    @Override
    public List<Object[]> countStudentsByDepartment() {
        Map<String, Long> map = students.values().stream()
                .filter(s -> s.getDepartment() != null)
                .collect(Collectors.groupingBy(Student::getDepartment, Collectors.counting()));

        List<Object[]> result = new ArrayList<>();
        map.forEach((dept, count) -> result.add(new Object[]{dept, count}));
        return result;
    }

    @Override
    public void deleteAll() {
        students.clear();
        idSequence.set(0);
    }

    private Comparator<Student> getComparator(String sortBy) {
        if (sortBy == null) return Comparator.comparing(Student::getId, Comparator.nullsLast(Comparator.naturalOrder()));
        return switch (sortBy.toLowerCase()) {
            case "studentid" -> Comparator.comparing(Student::getStudentId, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
            case "firstname" -> Comparator.comparing(Student::getFirstName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
            case "lastname" -> Comparator.comparing(Student::getLastName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
            case "email" -> Comparator.comparing(Student::getEmail, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
            case "department" -> Comparator.comparing(Student::getDepartment, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
            case "year" -> Comparator.comparing(Student::getYear, Comparator.nullsLast(Comparator.naturalOrder()));
            case "marks" -> Comparator.comparing(Student::getMarks, Comparator.nullsLast(Comparator.naturalOrder()));
            case "attendance" -> Comparator.comparing(Student::getAttendance, Comparator.nullsLast(Comparator.naturalOrder()));
            default -> Comparator.comparing(Student::getId, Comparator.nullsLast(Comparator.naturalOrder()));
        };
    }
}
