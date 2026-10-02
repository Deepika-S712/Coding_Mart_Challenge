import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Pagination } from '../../components/Pagination';
import { Badge } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/SkeletonLoading';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { FeeStructureModal } from '../components/modals/FeeStructureModal';
import { DeleteFeeModal } from '../components/modals/DeleteFeeModal';
import { Toast } from '../../components/Toast';
import { accountantApi } from '../api/accountantApi';

export const FeeStructurePage = () => {
  const [feeStructures, setFeeStructures] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 8;

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deletingItem, setDeletingItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    fetchFeeStructures();
  }, [search, deptFilter, yearFilter, semesterFilter, statusFilter, currentPage]);

  const loadDepartments = async () => {
    try {
      const res = await accountantApi.getDepartments();
      setDepartments(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFeeStructures = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        search,
        department: deptFilter,
        year: yearFilter,
        semester: semesterFilter,
        status: statusFilter,
        page: currentPage,
        limit: pageSize,
      };
      const response = await accountantApi.getFeeStructures(params);
      setFeeStructures(response.data || []);
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages || 1);
        setTotalElements(response.pagination.totalElements || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve fee structures.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      if (editingItem) {
        await accountantApi.updateFeeStructure(editingItem.id, formData);
        setToast({ message: 'Fee structure updated successfully!', type: 'success' });
      } else {
        await accountantApi.createFeeStructure(formData);
        setToast({ message: 'New fee structure created successfully!', type: 'success' });
      }
      setIsModalOpen(false);
      setEditingItem(null);
      fetchFeeStructures();
    } catch (err) {
      setToast({ message: err.message || 'Failed to save fee structure.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await accountantApi.deleteFeeStructure(deletingItem.id);
      setToast({ message: 'Fee structure deleted successfully.', type: 'success' });
      setDeletingItem(null);
      fetchFeeStructures();
    } catch (err) {
      setToast({ message: err.message || 'Could not delete fee structure.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setDeptFilter('');
    setYearFilter('');
    setSemesterFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">
            Fee Structure Management
          </h1>
          <p className="text-[14px] text-[#475569] mt-1">
            Define, update, and manage academic fee structures and components by department.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[14px] font-medium rounded-[8px] shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span>Add Fee Structure</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-[12px] border border-[#E2E8F0] shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search year or department..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#CBD5E1] rounded-[8px] text-[14px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[8px] text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id || d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[8px] text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="">All Years</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <select
              value={semesterFilter}
              onChange={(e) => {
                setSemesterFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[8px] text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={String(s)}>
                  Sem {s}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[8px] text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {(search || deptFilter || yearFilter || semesterFilter || statusFilter) && (
          <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-[12px] text-[#475569]">
            <span>Active filters applied</span>
            <button
              onClick={resetFilters}
              className="text-[#2563EB] hover:text-[#1D4ED8] font-medium"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={8} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchFeeStructures} />
      ) : feeStructures.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No fee structures found"
          description="No fee schedules match your search filters. Try resetting filters or add a new schedule."
          actionText="Add Fee Structure"
          onAction={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[12px] font-semibold text-[#475569] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-5">Academic Year</th>
                  <th className="py-3 px-5">Department</th>
                  <th className="py-3 px-5">Year / Sem</th>
                  <th className="py-3 px-5 text-right">Tuition</th>
                  <th className="py-3 px-5 text-right">Other Fees</th>
                  <th className="py-3 px-5 text-right">Total Fee</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {feeStructures.map((f) => {
                  const otherTotal =
                    parseFloat(f.exam_fee || 0) +
                    parseFloat(f.library_fee || 0) +
                    parseFloat(f.transport_fee || 0) +
                    parseFloat(f.hostel_fee || 0) +
                    parseFloat(f.other_fee || 0);

                  return (
                    <tr key={f.id} className="hover:bg-[#F8FAFC]/60 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-[#0F172A]">
                        {f.academic_year}
                      </td>
                      <td className="py-3.5 px-5 text-[#475569]">{f.department}</td>
                      <td className="py-3.5 px-5 text-[#475569]">
                        Year {f.year}, Sem {f.semester}
                      </td>
                      <td className="py-3.5 px-5 text-right text-[#0F172A] font-medium">
                        ${parseFloat(f.tuition_fee).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-5 text-right text-[#475569]">
                        ${otherTotal.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-5 text-right font-bold text-[#0F172A]">
                        ${parseFloat(f.total_fee).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <Badge status={f.status} />
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(f);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-[#475569] hover:text-[#2563EB] hover:bg-[#DBEAFE]/40 rounded-[6px] transition-colors"
                          title="Edit Fee Structure"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingItem(f)}
                          className="p-1.5 text-[#475569] hover:text-[#DC2626] hover:bg-[#FEE2E2]/50 rounded-[6px] transition-colors"
                          title="Delete Fee Structure"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}

      {/* Add / Edit Modal */}
      <FeeStructureModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSave}
        initialData={editingItem}
        departments={departments}
        isSaving={isSaving}
      />

      {/* Delete Confirmation Modal */}
      <DeleteFeeModal
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        feeStructure={deletingItem}
        isDeleting={isDeleting}
      />

      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}
    </div>
  );
};
