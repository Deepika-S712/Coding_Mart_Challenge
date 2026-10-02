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
  FolderOpen,
  Plus,
  Search,
  FileText,
  Video,
  Link2,
  FileCode,
  Edit2,
  Trash2,
  ExternalLink,
  Calendar,
  HardDrive
} from 'lucide-react';

const contentTypes = ['All', 'PDF', 'Notes', 'Document', 'Presentation', 'Video', 'External Link'];

export const FacultyContent = () => {
  const [contentList, setContentList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subjectCode: 'CS301',
    subjectName: 'Design & Analysis of Algorithms',
    class: 'CSE-3A',
    contentType: 'PDF',
    description: '',
    url: '',
    fileSize: '3.5 MB'
  });
  const [saving, setSaving] = useState(false);

  const toast = useToast();

  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/faculty/content');
      setContentList(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load study content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      subjectCode: 'CS301',
      subjectName: 'Design & Analysis of Algorithms',
      class: 'CSE-3A',
      contentType: 'PDF',
      description: '',
      url: 'https://cms-files.ac.in/notes/unit1.pdf',
      fileSize: '2.5 MB'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({ ...item });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleCreateContent = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post('/faculty/content', formData);
      toast.success('Course material uploaded successfully.');
      setIsAddModalOpen(false);
      fetchContent();
    } catch (err) {
      toast.error(err.message || 'Failed to upload content.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateContent = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put(`/faculty/content/${selectedItem.id}`, formData);
      toast.success('Course material updated.');
      setIsEditModalOpen(false);
      fetchContent();
    } catch (err) {
      toast.error(err.message || 'Failed to update content.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContent = async () => {
    setSaving(true);
    try {
      await apiClient.delete(`/faculty/content/${selectedItem.id}`);
      toast.success('Course content removed.');
      setIsDeleteModalOpen(false);
      fetchContent();
    } catch (err) {
      toast.error(err.message || 'Failed to delete content.');
    } finally {
      setSaving(false);
    }
  };

  const filteredList = contentList.filter((item) => {
    const matchesType = selectedType === 'All' || item.contentType.toLowerCase() === selectedType.toLowerCase();
    const matchesSearch =
      searchTerm === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Video':
        return <Video className="w-5 h-5 text-red-500" />;
      case 'External Link':
        return <Link2 className="w-5 h-5 text-blue-500" />;
      case 'Presentation':
        return <FileCode className="w-5 h-5 text-amber-500" />;
      default:
        return <FileText className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-lg border border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Course Content & Study Materials</h2>
          <p className="text-xs text-[#64748B]">
            Upload and organize lecture notes, presentations, reference links, and video resources
          </p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
          Upload Course Material
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Content Type Filter */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {contentTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                selectedType === type
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-100 text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full md:w-64">
          <Input
            icon={Search}
            placeholder="Search material title, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <Skeleton className="h-96 rounded-lg" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchContent} />
      ) : filteredList.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No study materials found"
          description="Upload documents or adjust search filters to browse course content."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm hover:border-blue-200 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-100">{getTypeIcon(item.contentType)}</div>
                    <div>
                      <span className="font-mono text-xs font-bold text-primary mr-1.5">{item.subjectCode}</span>
                      <Badge variant="neutral" size="sm">
                        {item.contentType}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-[#64748B] hover:text-primary hover:bg-slate-100 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(item)}
                      className="p-1.5 text-[#64748B] hover:text-error hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[#0F172A]">{item.title}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-primary" /> {item.uploadedDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3" /> {item.fileSize}
                  </span>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-primary font-semibold hover:underline"
                >
                  Access <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Content Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Upload New Course Material"
        subtitle="Publish notes, presentations, or reference resources"
      >
        <form onSubmit={handleCreateContent} className="space-y-4">
          <Input
            label="Material Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Unit 4: Graph Algorithms & Minimum Spanning Trees"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Subject Code"
              required
              value={formData.subjectCode}
              onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
            />
            <Select
              label="Content Type"
              value={formData.contentType}
              onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
              options={['PDF', 'Notes', 'Document', 'Presentation', 'Video', 'External Link']}
            />
          </div>
          <Input
            label="Resource Link / URL"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://drive.google.com/... or /files/doc.pdf"
          />
          <Input
            label="File Size / Duration"
            value={formData.fileSize}
            onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
            placeholder="e.g. 4.2 MB or 35 Mins"
          />
          <Input
            label="Description / Syllabus Coverage"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief overview of topics covered..."
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Publish Material
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Content Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Course Material"
      >
        <form onSubmit={handleUpdateContent} className="space-y-4">
          <Input
            label="Material Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Subject Code"
              required
              value={formData.subjectCode}
              onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
            />
            <Select
              label="Content Type"
              value={formData.contentType}
              onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
              options={['PDF', 'Notes', 'Document', 'Presentation', 'Video', 'External Link']}
            />
          </div>
          <Input
            label="Resource Link / URL"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
        title="Delete Material"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4 text-sm">
          <p className="text-[#64748B]">
            Are you sure you want to delete <span className="font-bold text-[#0F172A]">{selectedItem?.title}</span>?
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={saving} onClick={handleDeleteContent}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FacultyContent;
