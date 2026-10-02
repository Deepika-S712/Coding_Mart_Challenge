import React from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const StudentTable = ({
  students,
  onViewClick,
  onEditClick,
  onDeleteClick,
  isLoading
}) => {
  const { isAdmin } = useAuth();

  const getGradeBadge = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'B':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'C':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'D':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-sm text-gray-500">Loading student records...</p>
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-base font-semibold text-gray-700">No students found</p>
        <p className="text-sm text-gray-500 mt-1">Try adjusting your search query or filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50 font-medium text-gray-500">
          <tr>
            <th scope="col" className="px-6 py-3.5">Student</th>
            <th scope="col" className="px-6 py-3.5">Department</th>
            <th scope="col" className="px-6 py-3.5">Year</th>
            <th scope="col" className="px-6 py-3.5">Marks</th>
            <th scope="col" className="px-6 py-3.5">Attendance</th>
            <th scope="col" className="px-6 py-3.5">Grade</th>
            <th scope="col" className="px-6 py-3.5">Status</th>
            <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {students.map((student, index) => (
            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="text-xs text-gray-500">{student.studentId} • {student.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                {student.department}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                Year {student.year}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="font-medium text-gray-900">
                  {student.marks !== null ? student.marks : '-'}
                </span>
                <span className="text-xs text-gray-400"> / 100</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`font-medium ${
                  (student.attendance || 0) >= 75 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {student.attendance !== null ? `${student.attendance}%` : '-'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${getGradeBadge(student.grade)}`}>
                  {student.grade || 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                  student.passed
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {student.passed ? 'PASSED' : 'FAILED'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                <button
                  onClick={() => onViewClick(student)}
                  className="text-gray-400 hover:text-blue-600 p-1 rounded transition-colors"
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onEditClick(student)}
                  className="text-gray-400 hover:text-amber-600 p-1 rounded transition-colors"
                  title="Edit Student"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                {isAdmin && (
                  <button
                    onClick={() => onDeleteClick(student, index)}
                    className="text-gray-400 hover:text-rose-600 p-1 rounded transition-colors"
                    title="Delete Student"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
