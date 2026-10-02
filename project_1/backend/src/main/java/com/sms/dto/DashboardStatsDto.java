package com.sms.dto;

import java.util.Map;

public class DashboardStatsDto {

    private long totalStudents;
    private double averageMarks;
    private double averageAttendance;
    private long passedCount;
    private long failedCount;
    private Map<String, Long> departmentCounts;

    public DashboardStatsDto() {
    }

    public DashboardStatsDto(long totalStudents, double averageMarks, double averageAttendance,
                             long passedCount, long failedCount, Map<String, Long> departmentCounts) {
        this.totalStudents = totalStudents;
        this.averageMarks = averageMarks;
        this.averageAttendance = averageAttendance;
        this.passedCount = passedCount;
        this.failedCount = failedCount;
        this.departmentCounts = departmentCounts;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public double getAverageMarks() {
        return averageMarks;
    }

    public void setAverageMarks(double averageMarks) {
        this.averageMarks = averageMarks;
    }

    public double getAverageAttendance() {
        return averageAttendance;
    }

    public void setAverageAttendance(double averageAttendance) {
        this.averageAttendance = averageAttendance;
    }

    public long getPassedCount() {
        return passedCount;
    }

    public void setPassedCount(long passedCount) {
        this.passedCount = passedCount;
    }

    public long getFailedCount() {
        return failedCount;
    }

    public void setFailedCount(long failedCount) {
        this.failedCount = failedCount;
    }

    public Map<String, Long> getDepartmentCounts() {
        return departmentCounts;
    }

    public void setDepartmentCounts(Map<String, Long> departmentCounts) {
        this.departmentCounts = departmentCounts;
    }
}
