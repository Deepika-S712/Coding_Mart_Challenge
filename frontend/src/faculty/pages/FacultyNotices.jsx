import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../components/common/Toast';
import {
  Bell,
  Plus,
  Pin,
  Edit2,
  Trash2,
  Search,
  Calendar,
  AlertCircle
} from 'lucide-react';

const categories = ['Academic', 'Examination', 'Urgent', 'General'];
const priorities = ['Normal', 'High', 'Urgent'];

export const FacultyNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Academic',
    priority: 'Normal',
    targetClass: 'CSE-3A',
    content: '',
    isPinned: false
  });
  const [saving, setSaving] = useState(false);

  const toast = useToast();

  const fetchNotices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/faculty/notices');
      setNotices(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load notices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      category: 'Academic',
      priority: 'Normal',
      targetClass: 'CSE-3A',
      content: '',
      isPinned: false
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (not) => {
    setSelectedNotice(not);
    setFormData({ ...not });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (not) => {
    setSelectedNotice(not);
    setIsDeleteModalOpen(true);
  };

  const handleTogglePin = async (noticeId) => {
    try {
      await apiClient.put(`/faculty/notices/${noticeId}/pin`);
      toast.success('Notice pin status updated.');
      fetchNotices();
    } catch (err) {
      toast.error(err.message || 'Failed to update pin state.');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post('/faculty/notices', formData);
      toast.success('Notice published to class board.');
      setIsAddModalOpen(false);
      fetchNotices();
    } catch (err) {
      toast.error(err.message || 'Failed to publish notice.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put(`/faculty/notices/${selectedNotice.id}`, formData);
      toast.success('Notice updated.');
      setIsEditModalOpen(false);
      fetchNotices();
    } catch (err) {
      toast.error(err.message || 'Failed to update notice.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await apiClient.delete(`/faculty/notices/${selectedNotice.id}`);
      toast.success('Notice deleted.');
      setIsDeleteModalOpen(false);
      fetchNotices();
    } catch (err) {
      toast.error(err.message || 'Failed to delete notice.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-lg border border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Class Circulars & Bulletins</h2>
          <p className="text-xs text-[#64748B]">
            Publish announcements, lab deadlines, and urgent notices to students
          </p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
          Publish Notice
        </Button>
      </div>

      {/* Notices List */}
      {loading ? (
        <Skeleton className="h-96 rounded-lg" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchNotices} />
      ) : notices.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notices published"
          description="Create your first notice to broadcast messages to your students."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {notices.map((not) => (
            <div
              key={not.id}
              className={`bg-white rounded-lg border p-5 shadow-sm space-y-2 transition-all ${
                not.isPinned ? 'border-primary/40 bg-blue-50/20' : 'border-[#E2E8F0]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {not.isPinned && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-primary flex items-center gap-1">
                      <Pin className="w-3 h-3" /> PINNED NOTICE
                    </span>
                  )}
                  <Badge
                    variant={not.priority === 'Urgent' ? 'error' : not.category === 'Academic' ? 'primary' : 'info'}
                    size="sm"
                  >
                    {not.category}
                  </Badge>
                  <span className="text-xs font-semibold text-[#64748B]">
                    Class: {not.targetClass || 'CSE-3A'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#64748B] flex items-center gap-1 mr-2">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> {not.date}
                  </span>

                  <button
                    onClick={() => handleTogglePin(not.id)}
                    className={`p-1.5 rounded transition-colors ${
                      not.isPinned
                        ? 'text-primary bg-blue-100'
                        : 'text-[#64748B] hover:text-primary hover:bg-slate-100'
                    }`}
                    title={not.isPinned ? 'Unpin' : 'Pin to Top'}
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(not)}
                    className="p-1.5 text-[#64748B] hover:text-primary hover:bg-slate-100 rounded"
                    title="Edit Notice"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenDelete(not)}
                    className="p-1.5 text-[#64748B] hover:text-error hover:bg-red-50 rounded"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-[#0F172A]">{not.title}</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">{not.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Notice Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Publish Department Notice"
        subtitle="Broadcast to students in class stream"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Notice Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Lab Record Submission Deadline"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={categories}
            />
            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              options={priorities}
            />
          </div>
          <Input
            label="Target Class"
            value={formData.targetClass}
            onChange={(e) => setFormData({ ...formData, targetClass: e.target.value })}
          />
          <Input
            label="Notice Content / Description"
            required
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Detailed instructions or bulletin..."
          />
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="pin-check"
              checked={formData.isPinned}
              onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
              className="rounded text-primary focus:ring-primary h-4 w-4"
            />
            <label htmlFor="pin-check" className="text-xs font-semibold text-[#0F172A]">
              Pin this notice to top of student bulletin
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Broadcast Notice
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Notice Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Notice"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Notice Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={categories}
            />
            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              options={priorities}
            />
          </div>
          <Input
            label="Notice Content"
            required
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Notice"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4 text-sm">
          <p className="text-[#64748B]">
            Are you sure you want to delete this notice?
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={saving} onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FacultyNotices;
