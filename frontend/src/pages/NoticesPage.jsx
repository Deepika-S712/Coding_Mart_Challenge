import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  Plus,
  Search,
  Pin,
  PinOff,
  Calendar,
  User,
  Users,
  AlertTriangle,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Filter
} from 'lucide-react';
import { noticeApi } from '../api/noticeApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';

const CATEGORY_OPTIONS = ['All', 'Academic', 'Examination', 'Urgent', 'General'];
const PRIORITY_OPTIONS = ['All', 'High', 'Normal', 'Low'];

export function NoticesPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');

  // Modals
  const [formModal, setFormModal] = useState({ open: false, isEdit: false, notice: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, notice: null });

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Academic',
    targetAudience: 'CSE-3A',
    priority: 'Normal',
    content: '',
    pinned: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Notices
  const fetchNotices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await noticeApi.getAll({
        category: selectedCategory === 'All' ? '' : selectedCategory
      });
      if (res.success && res.data) {
        setNotices(res.data);
      } else {
        throw new Error(res.message || 'Failed to fetch notices');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with notice board');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [selectedCategory]);

  // Statistics
  const metrics = useMemo(() => {
    const total = notices.length;
    const pinned = notices.filter((n) => n.pinned).length;
    const urgent = notices.filter((n) => n.priority === 'High' || n.category === 'Urgent').length;
    const academic = notices.filter((n) => n.category === 'Academic').length;
    return { total, pinned, urgent, academic };
  }, [notices]);

  // Filtered Notices List
  const filteredNotices = useMemo(() => {
    return notices
      .filter((n) => {
        const matchesSearch =
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.targetAudience.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesPriority =
          selectedPriority === 'All' || n.priority?.toLowerCase() === selectedPriority.toLowerCase();

        return matchesSearch && matchesPriority;
      })
      .sort((a, b) => {
        // Pinned first, then by publish date
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.publishDate) - new Date(a.publishDate);
      });
  }, [notices, searchQuery, selectedPriority]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      title: '',
      category: 'Academic',
      targetAudience: 'CSE-3A, CSE-3B',
      priority: 'Normal',
      content: '',
      pinned: false
    });
    setFormErrors({});
    setFormModal({ open: true, isEdit: false, notice: null });
  };

  // Open Edit Modal
  const handleOpenEdit = (notice) => {
    setFormData({
      title: notice.title,
      category: notice.category,
      targetAudience: notice.targetAudience,
      priority: notice.priority || 'Normal',
      content: notice.content,
      pinned: !!notice.pinned
    });
    setFormErrors({});
    setFormModal({ open: true, isEdit: true, notice });
  };

  // Toggle Pin directly
  const handleTogglePin = async (notice) => {
    try {
      const res = await noticeApi.update(notice.id, {
        ...notice,
        pinned: !notice.pinned
      });
      if (res.success) {
        toast.success(notice.pinned ? 'Notice unpinned' : 'Notice pinned to top');
        fetchNotices();
      }
    } catch (err) {
      toast.error('Failed to update pin status');
    }
  };

  // Form Validation
  const validateForm = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Notice title is required';
    if (!formData.targetAudience.trim()) errs.targetAudience = 'Target audience is required';
    if (!formData.content.trim()) errs.content = 'Notice announcement content is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Notice Form
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (formModal.isEdit) {
        const res = await noticeApi.update(formModal.notice.id, formData);
        if (res.success) {
          toast.success('Notice announcement updated');
          setFormModal({ open: false, isEdit: false, notice: null });
          fetchNotices();
        } else {
          throw new Error(res.message || 'Failed to update notice');
        }
      } else {
        const res = await noticeApi.create(formData);
        if (res.success) {
          toast.success('Notice published to bulletin board');
          setFormModal({ open: false, isEdit: false, notice: null });
          fetchNotices();
        } else {
          throw new Error(res.message || 'Failed to publish notice');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Notice
  const handleDeleteNotice = async () => {
    if (!deleteModal.notice) return;
    try {
      const res = await noticeApi.delete(deleteModal.notice.id);
      if (res.success) {
        toast.success('Notice deleted successfully');
        setDeleteModal({ open: false, notice: null });
        fetchNotices();
      } else {
        throw new Error(res.message || 'Failed to delete notice');
      }
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const getCategoryVariant = (cat) => {
    if (cat === 'Academic') return 'primary';
    if (cat === 'Examination') return 'neutral';
    if (cat === 'Urgent') return 'danger';
    return 'neutral';
  };

  const getPriorityVariant = (prio) => {
    if (prio === 'High') return 'danger';
    if (prio === 'Normal') return 'primary';
    return 'neutral';
  };

  return (
    <div>
      {/* Page Header */}
      <div className="cms-page-header">
        <div>
          <h1 className="cms-page-title">Notice Board & Announcements</h1>
          <p className="cms-page-subtitle">
            Publish department circulars, examination updates, and classroom notifications
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            <Plus size={16} style={{ marginRight: '6px' }} />
            Publish Notice
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="cms-stats-grid">
        <div className="cms-stat-card">
          <div>
            <div className="cms-stat-value">{metrics.total}</div>
            <div className="cms-stat-label">Total Notices</div>
          </div>
          <div className="cms-stat-icon" style={{ backgroundColor: 'var(--cms-primary-light)', color: 'var(--cms-primary)' }}>
            <Bell size={24} />
          </div>
        </div>

        <div className="cms-stat-card">
          <div>
            <div className="cms-stat-value">{metrics.pinned}</div>
            <div className="cms-stat-label">Pinned Announcements</div>
          </div>
          <div className="cms-stat-icon" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <Pin size={24} />
          </div>
        </div>

        <div className="cms-stat-card">
          <div>
            <div className="cms-stat-value">{metrics.urgent}</div>
            <div className="cms-stat-label">High Priority / Urgent</div>
          </div>
          <div className="cms-stat-icon" style={{ backgroundColor: '#FEE2E2', color: 'var(--cms-danger)' }}>
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="cms-stat-card">
          <div>
            <div className="cms-stat-value">{metrics.academic}</div>
            <div className="cms-stat-label">Academic Notices</div>
          </div>
          <div className="cms-stat-icon" style={{ backgroundColor: '#DCFCE7', color: 'var(--cms-success)' }}>
            <FileText size={24} />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card style={{ marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Search */}
          <div style={{ flex: '1 1 260px', position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--cms-text-muted)',
                pointerEvents: 'none',
                display: 'flex'
              }}
            >
              <Search size={16} />
            </div>
            <input
              type="text"
              className="cms-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search notices by title, content, or audience..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--cms-bg-subtle)', padding: '4px', borderRadius: 'var(--cms-radius-md)' }}>
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: selectedCategory === cat ? 600 : 500,
                  color: selectedCategory === cat ? 'var(--cms-primary)' : 'var(--cms-text-secondary)',
                  backgroundColor: selectedCategory === cat ? 'var(--cms-bg-surface)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--cms-radius-sm)',
                  cursor: 'pointer',
                  boxShadow: selectedCategory === cat ? 'var(--cms-shadow-sm)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <div style={{ flex: '0 1 180px' }}>
            <select
              className="cms-select"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Normal">Normal Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Notice Cards Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState title="Error Loading Notices" message={error} onRetry={fetchNotices} />
      ) : filteredNotices.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notices found"
          description={
            searchQuery || selectedCategory !== 'All' || selectedPriority !== 'All'
              ? 'No announcements match the selected filter criteria.'
              : 'Create your first notice announcement for students.'
          }
          action={
            <Button variant="primary" size="sm" onClick={handleOpenCreate}>
              <Plus size={16} style={{ marginRight: '6px' }} />
              Publish Notice
            </Button>
          }
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {filteredNotices.map((notice) => (
            <Card
              key={notice.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: notice.pinned ? '4px solid #D97706' : '1px solid var(--cms-border-subtle)',
                backgroundColor: notice.pinned ? '#FFFDF5' : 'var(--cms-bg-surface)'
              }}
            >
              <div>
                {/* Header Strip: Badges & Pin action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <Badge variant={getCategoryVariant(notice.category)}>
                      {notice.category}
                    </Badge>
                    {notice.priority === 'High' && (
                      <Badge variant="danger">High Priority</Badge>
                    )}
                  </div>

                  <button
                    onClick={() => handleTogglePin(notice)}
                    title={notice.pinned ? 'Unpin notice' : 'Pin notice to top'}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: notice.pinned ? '#D97706' : 'var(--cms-text-muted)',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: 'var(--cms-radius-sm)'
                    }}
                  >
                    {notice.pinned ? <Pin size={16} fill="#D97706" /> : <Pin size={16} />}
                  </button>
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'var(--cms-text-primary)',
                    marginBottom: '8px',
                    lineHeight: 1.3
                  }}
                >
                  {notice.title}
                </h3>

                {/* Audience Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', fontSize: '12px', color: 'var(--cms-text-secondary)' }}>
                  <Users size={14} color="var(--cms-text-muted)" />
                  <span>Audience: <strong>{notice.targetAudience}</strong></span>
                </div>

                {/* Content body */}
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--cms-text-secondary)',
                    lineHeight: 1.5,
                    marginBottom: '16px',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {notice.content}
                </p>
              </div>

              {/* Footer Meta & Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid var(--cms-border-subtle)',
                  paddingTop: '12px',
                  fontSize: '12px',
                  color: 'var(--cms-text-muted)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={13} />
                  <span>{notice.publishDate}</span>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(notice)}
                    aria-label="Edit notice"
                  >
                    <Edit2 size={13} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    style={{ color: 'var(--cms-danger)', borderColor: '#FCA5A5' }}
                    onClick={() => setDeleteModal({ open: true, notice })}
                    aria-label="Delete notice"
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE / EDIT NOTICE MODAL */}
      <Modal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, isEdit: false, notice: null })}
        title={formModal.isEdit ? 'Edit Notice Announcement' : 'Publish New Notice'}
        maxWidth="580px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button
              variant="outline"
              size="md"
              onClick={() => setFormModal({ open: false, isEdit: false, notice: null })}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmitForm}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Saving...'
                : formModal.isEdit
                ? 'Update Notice'
                : 'Publish to Board'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Notice Title"
            required
            placeholder="e.g. Mid-Term Project Milestone Presentation Schedule"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={formErrors.title}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="cms-form-group">
              <label className="cms-label">Category</label>
              <select
                className="cms-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Academic">Academic</option>
                <option value="Examination">Examination</option>
                <option value="Urgent">Urgent</option>
                <option value="General">General</option>
              </select>
            </div>

            <div className="cms-form-group">
              <label className="cms-label">Priority Level</label>
              <select
                className="cms-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Normal">Normal Priority</option>
                <option value="High">High Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          <Input
            label="Target Audience"
            required
            placeholder="e.g. CSE-3A, CSE-3B or All Students"
            value={formData.targetAudience}
            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
            error={formErrors.targetAudience}
            helperText="Specify class batches or departments that should see this notice"
          />

          <div className="cms-form-group">
            <label className="cms-label">
              Announcement Body <span style={{ color: 'var(--cms-danger)' }}>*</span>
            </label>
            <textarea
              className={`cms-input ${formErrors.content ? 'cms-input-error' : ''}`}
              rows={4}
              placeholder="Write the full announcement text, instructions, dates, and instructions..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              style={{ resize: 'vertical' }}
            />
            {formErrors.content && <p className="cms-error-text">{formErrors.content}</p>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="pinned-checkbox"
              checked={formData.pinned}
              onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="pinned-checkbox" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--cms-text-primary)', cursor: 'pointer' }}>
              Pin this notice to the top of the bulletin board
            </label>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, notice: null })}
        title="Delete Notice"
        maxWidth="460px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button
              variant="outline"
              size="md"
              onClick={() => setDeleteModal({ open: false, notice: null })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleDeleteNotice}
            >
              Delete Notice
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--cms-radius-full)',
              backgroundColor: '#FEE2E2',
              color: 'var(--cms-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <AlertCircle size={22} />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cms-text-primary)', marginBottom: '6px' }}>
              Are you sure you want to delete this notice?
            </p>
            <p style={{ fontSize: '13px', color: 'var(--cms-text-secondary)', lineHeight: 1.4 }}>
              <strong>{deleteModal.notice?.title}</strong> will be removed from the active notice board.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
