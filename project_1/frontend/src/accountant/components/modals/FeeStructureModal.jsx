import React, { useState, useEffect } from 'react';
import { X, Layers, AlertCircle } from 'lucide-react';

export const FeeStructureModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  departments = [],
  isSaving = false,
}) => {
  const [formData, setFormData] = useState({
    academic_year: '2026-2027',
    department: '',
    year: '1',
    semester: '1',
    tuition_fee: 0,
    exam_fee: 0,
    library_fee: 0,
    transport_fee: 0,
    hostel_fee: 0,
    other_fee: 0,
    status: 'Active',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        academic_year: initialData.academic_year || '2026-2027',
        department: initialData.department || (departments[0]?.name || ''),
        year: String(initialData.year || 1),
        semester: String(initialData.semester || 1),
        tuition_fee: initialData.tuition_fee || 0,
        exam_fee: initialData.exam_fee || 0,
        library_fee: initialData.library_fee || 0,
        transport_fee: initialData.transport_fee || 0,
        hostel_fee: initialData.hostel_fee || 0,
        other_fee: initialData.other_fee || 0,
        status: initialData.status || 'Active',
      });
    } else {
      setFormData({
        academic_year: '2026-2027',
        department: departments[0]?.name || 'Computer Science & Engineering',
        year: '1',
        semester: '1',
        tuition_fee: 0,
        exam_fee: 0,
        library_fee: 0,
        transport_fee: 0,
        hostel_fee: 0,
        other_fee: 0,
        status: 'Active',
      });
    }
    setError('');
  }, [initialData, departments, isOpen]);

  if (!isOpen) return null;

  const totalFee =
    parseFloat(formData.tuition_fee || 0) +
    parseFloat(formData.exam_fee || 0) +
    parseFloat(formData.library_fee || 0) +
    parseFloat(formData.transport_fee || 0) +
    parseFloat(formData.hostel_fee || 0) +
    parseFloat(formData.other_fee || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFeeChange = (e) => {
    const { name, value } = e.target;
    const num = Math.max(0, parseFloat(value) || 0);
    setFormData((prev) => ({
      ...prev,
      [name]: num,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.academic_year.trim()) {
      setError('Academic Year is required.');
      return;
    }
    if (!formData.department) {
      setError('Department is required.');
      return;
    }
    if (totalFee <= 0) {
      setError('Total fee must be greater than zero.');
      return;
    }
    setError('');
    onSubmit({
      ...formData,
      year: parseInt(formData.year, 10),
      semester: parseInt(formData.semester, 10),
      total_fee: totalFee,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[12px] shadow-2xl max-w-2xl w-full p-6 border border-[#E2E8F0] my-8 animate-scale-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#DBEAFE] text-[#2563EB] rounded-[8px]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[20px] font-bold text-[#0F172A]">
                {initialData ? 'Edit Fee Structure' : 'Add New Fee Structure'}
              </h3>
              <p className="text-[12px] text-[#475569]">
                Configure standard fee schedule for department and academic period.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[6px] text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-[8px] flex items-center space-x-2 text-[14px] text-[#DC2626]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-medium text-[#0F172A] mb-1">
                Academic Year *
              </label>
              <input
                type="text"
                name="academic_year"
                required
                value={formData.academic_year}
                onChange={handleChange}
                placeholder="e.g. 2026-2027"
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[8px] text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#0F172A] mb-1">
                Department *
              </label>
              <select
                name="department"
                required
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[8px] text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                {departments.map((dept) => (
                  <option key={dept.id || dept.name} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#0F172A] mb-1">
                Year *
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[8px] text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#0F172A] mb-1">
                Semester *
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[8px] text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={String(s)}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-[#E2E8F0]">
            <h4 className="text-[14px] font-semibold text-[#0F172A] mb-3">
              Fee Components Breakdown ($)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[#475569] mb-1">
                  Tuition Fee
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  name="tuition_fee"
                  value={formData.tuition_fee}
                  onChange={handleFeeChange}
                  className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#475569] mb-1">
                  Exam Fee
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  name="exam_fee"
                  value={formData.exam_fee}
                  onChange={handleFeeChange}
                  className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#475569] mb-1">
                  Library Fee
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  name="library_fee"
                  value={formData.library_fee}
                  onChange={handleFeeChange}
                  className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#475569] mb-1">
                  Transport Fee
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  name="transport_fee"
                  value={formData.transport_fee}
                  onChange={handleFeeChange}
                  className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#475569] mb-1">
                  Hostel Fee
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  name="hostel_fee"
                  value={formData.hostel_fee}
                  onChange={handleFeeChange}
                  className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#475569] mb-1">
                  Other Fee
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  name="other_fee"
                  value={formData.other_fee}
                  onChange={handleFeeChange}
                  className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            </div>
          </div>

          {/* Total Calculated Fee Card */}
          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] flex items-center justify-between">
            <div>
              <span className="text-[12px] font-semibold text-[#475569] uppercase tracking-wider block">
                Calculated Total Fee
              </span>
              <span className="text-[20px] font-bold text-[#0F172A]">
                ${totalFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#475569] mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="px-3 py-1 bg-white border border-[#CBD5E1] rounded-[8px] text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-[#E2E8F0] flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#CBD5E1] rounded-[8px] text-[14px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[8px] text-[14px] font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : initialData ? 'Update Fee Structure' : 'Create Fee Structure'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
