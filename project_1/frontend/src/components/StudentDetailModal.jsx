import React from 'react';
import { X, Mail, Phone, Calendar, BookOpen, Award, CheckCircle2, XCircle } from 'lucide-react';

export const StudentDetailModal = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null;

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'B':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'D':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 sm:p-8 animate-scale-in">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-gray-900">
                {student.firstName} {student.lastName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                {student.studentId}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{student.department} • Year {student.year}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Award className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Grade & Marks</p>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className={`px-2 py-0.5 text-xs font-bold rounded border ${getGradeColor(student.grade)}`}>
                    {student.grade || 'N/A'}
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {student.marks !== null ? `${student.marks} / 100` : 'Not recorded'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {student.passed ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <XCircle className="h-5 w-5 text-rose-600" />
              )}
              <div>
                <p className="text-xs text-gray-500 font-medium">Academic Status</p>
                <span className={`inline-flex items-center mt-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                  student.passed
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {student.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
              <span>Attendance Rate</span>
              <span className="font-semibold text-gray-900">{student.attendance !== null ? `${student.attendance}%` : 'N/A'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  (student.attendance || 0) >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, student.attendance || 0))}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum requirement: 75% for exam eligibility</p>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact & Personal Details</h3>
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="h-4 w-4 mr-2.5 text-gray-400" />
              <span>{student.email}</span>
            </div>
            {student.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2.5 text-gray-400" />
                <span>{student.phone}</span>
              </div>
            )}
            {student.dateOfBirth && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2.5 text-gray-400" />
                <span>Date of Birth: {student.dateOfBirth}</span>
              </div>
            )}
            <div className="flex items-center text-sm text-gray-600">
              <BookOpen className="h-4 w-4 mr-2.5 text-gray-400" />
              <span>Registered: {student.createdDate ? new Date(student.createdDate).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
