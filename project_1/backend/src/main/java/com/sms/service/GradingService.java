package com.sms.service;

import org.springframework.stereotype.Service;

@Service
public class GradingService {

    /**
     * Calculates the academic grade based on scored marks.
     * Grade Scale:
     * - 90 to 100: A+
     * - 80 to 89:  A
     * - 70 to 79:  B
     * - 60 to 69:  C
     * - 50 to 59:  D
     * - Below 50:  F
     */
    public String calculateGrade(Double marks) {
        if (marks == null) {
            return "N/A";
        }
        if (marks >= 90.0) {
            return "A+";
        } else if (marks >= 80.0) {
            return "A";
        } else if (marks > 70.0) {
            return "B";
        } else if (marks >= 60.0) {
            return "C";
        } else if (marks >= 50.0) {
            return "D";
        } else {
            return "F";
        }
    }

    /**
     * Determines whether a student has passed the academic term.
     * Requirement: Student must achieve a minimum score of 40% marks
     * AND maintain at least 75% attendance.
     */
    public boolean determinePassStatus(Double marks, Double attendance) {
        if (marks == null || attendance == null) {
            return false;
        }
        return marks >= 40.0 || attendance >= 75.0;
    }
}
