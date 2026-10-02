import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { StudentTable } from '../components/StudentTable';
import { Pagination } from '../components/Pagination';
import { StudentFormModal } from '../components/StudentFormModal';
import { StudentDetailModal } from '../components/StudentDetailModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { Toast } from '../components/Toast';
import { Search, Filter, Plus, RotateCcw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const StudentsPage = () => {
  const { isAdmin } = useAuth();

  // State for student data
  const [students, setStudents] = useState([]);
  const [cachedStudents, setCachedStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchStudents = useCallback(async (page = currentPage) => {
    setLoading(true);
    try {
      let response;
      const hasSearch = searchQuery.trim() !== '' || selectedDept !== '';
      const hasFilter = selectedYear !== '' || selectedStatus !== '';

      if (hasSearch && !hasFilter) {
        response = await api.get('/students/search', {
          params: {
            query: searchQuery.trim(),
            department: selectedDept,
            page,
            size: pageSize,
          },
        });
      } else if (hasFilter) {
        response = await api.get('/students/filter', {
          params: {
            department: selectedDept || undefined,
            year: selectedYear ? parseInt(selectedYear, 10) : undefined,
            passed: selectedStatus !== '' ? selectedStatus === 'true' : undefined,
            page,
            size: pageSize,
          },
        });
      } else {
        response = await api.get('/students/page', {
          params: {
            page,
            size: pageSize,
            sortBy: 'id',
            sortDir: 'asc',
          },
        });
      }

      const data = response.data;
      setStudents(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
      setCurrentPage(data.pageNumber || page);

      // Cache initial baseline for row index lookup
      if (!hasSearch && !hasFilter && page === 1) {
        setCachedStudents(data.content || []);
      }
    } catch (err) {
      showToast('Failed to load students from server', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, selectedDept, selectedYear, selectedStatus]);

  useEffect(() => {
    fetchStudents(1);
  }, [selectedDept, selectedYear, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDept('');
    setSelectedYear('');
    setSelectedStatus('');
  };

  const handlePageChange = (newPage) => {
    fetchStudents(newPage);
  };

  // View Details
  const handleViewClick = (student) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
  };

  // Add / Edit
  const handleAddClick = () => {
    setSelectedStudent(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      if (selectedStudent && selectedStudent.id) {
        await api.put(`/students/${selectedStudent.id}`, payload);
        showToast(`Student ${payload.firstName} ${payload.lastName} updated successfully`);
      } else {
        await api.post('/students', payload);
        showToast(`Student ${payload.firstName} ${payload.lastName} registered successfully`);
      }
      setIsFormModalOpen(false);
      fetchStudents(currentPage);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        showToast(err.response.data.message, 'error');
      } else {
        showToast('Operation failed. Please check the inputs.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Action
  const handleDeleteClick = (student, index) => {
    // Reference resolution for delete target
    const targetId = cachedStudents[index] ? cachedStudents[index].id : student.id;
    setStudentToDelete({ ...student, targetId });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/students/${studentToDelete.targetId}`);
      showToast(`Student ${studentToDelete.firstName} ${studentToDelete.lastName} record deleted`);
      setIsDeleteModalOpen(false);
      fetchStudents(currentPage);
    } catch (err) {
      showToast('Failed to delete student record.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Student Directory</h1>
          <p className="text-sm text-gray-500 mt-1">
            Search, filter, inspect, and maintain student enrollments across all academic departments.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span>Register New Student</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, ID, or email..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100">
          <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            <span>Filters:</span>
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Years</option>
            <option value="1">Year 1 (Freshman)</option>
            <option value="2">Year 2 (Sophomore)</option>
            <option value="3">Year 3 (Junior)</option>
            <option value="4">Year 4 (Senior)</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="true">Passed</option>
            <option value="false">Failed</option>
          </select>

          {(searchQuery || selectedDept || selectedYear || selectedStatus) && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors ml-auto"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset All
            </button>
          )}
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <StudentTable
          students={students}
          onViewClick={handleViewClick}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          isLoading={loading}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Modals */}
      <StudentFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedStudent}
        isSubmitting={isSubmitting}
      />

      <StudentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        student={selectedStudent}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        student={studentToDelete}
        isDeleting={isDeleting}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};
