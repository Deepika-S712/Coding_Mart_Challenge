import React, { useState, useEffect } from 'react';
import { Bell, Search, Calendar, User, Download, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../design-system/Card';
import { Badge } from '../design-system/Badge';
import { Input } from '../design-system/Input';
import { Select } from '../design-system/Select';
import { Button } from '../design-system/Button';
import { CardSkeleton } from '../design-system/Skeleton';
import { ErrorState } from '../design-system/ErrorState';
import { EmptyState } from '../design-system/EmptyState';
import { Modal } from '../design-system/Modal';
import type { Announcement } from '../types/communication';
import { communicationService } from '../services/communicationService';
import { useToast } from '../design-system/Toast';
import './AnnouncementsPage.css';

export interface AnnouncementsPageProps {
  currentUserRole?: string;
}

export const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({ currentUserRole = 'Student' }) => {
  const { showToast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedImportance, setSelectedImportance] = useState<string>('All');

  // Detail Modal
  const [selectedAnn, setSelectedAnn] = useState<Announcement | null>(null);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    setIsError(false);

    const res = await communicationService.getAnnouncements(currentUserRole);
    setIsLoading(false);

    if (res.success && res.data) {
      setAnnouncements(res.data);
    } else {
      setIsError(true);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [currentUserRole]);

  const handleOpenDetail = (ann: Announcement) => {
    setSelectedAnn(ann);
    if (!ann.isRead) {
      communicationService.markAsRead(ann.id);
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === ann.id ? { ...a, isRead: true } : a))
      );
    }
  };

  const handleDownloadAttachment = (ann: Announcement) => {
    showToast(
      'Attachment Download Started',
      `Downloading official document: ${ann.attachmentName} (${ann.attachmentSize})`,
      'info'
    );
  };

  const filtered = announcements.filter((ann) => {
    const matchesSearch =
      ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.postedBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || ann.category === selectedCategory;
    const matchesImportance = selectedImportance === 'All' || ann.importance === selectedImportance;

    return matchesSearch && matchesCategory && matchesImportance;
  });

  if (isLoading) {
    return (
      <div className="cms-announcements-page">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Announcements Feed Unavailable"
        message="Unable to fetch campus notifications from the communication board."
        onRetry={fetchAnnouncements}
      />
    );
  }

  return (
    <div className="cms-announcements-page">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>
                <Bell size={18} className="text-indigo-600" />
                <span>Campus Announcements & Circulars</span>
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Official notices, exam updates, placement drives, and department circulars
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-56">
                <Input
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search size={14} />}
                />
              </div>

              <div className="w-40">
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  options={[
                    { value: 'All', label: 'All Categories' },
                    { value: 'Academic', label: 'Academic' },
                    { value: 'Exams', label: 'Exams' },
                    { value: 'Placement', label: 'Placement' },
                    { value: 'Events', label: 'Events' },
                    { value: 'General', label: 'General' },
                  ]}
                />
              </div>

              <div className="w-36">
                <Select
                  value={selectedImportance}
                  onChange={(e) => setSelectedImportance(e.target.value)}
                  options={[
                    { value: 'All', label: 'All Urgency' },
                    { value: 'High', label: 'High Priority' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'Normal', label: 'Normal' },
                  ]}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filtered.length === 0 ? (
            <EmptyState
              title="No Announcements Found"
              description="No campus notices match your applied search query or category filters."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedImportance('All');
              }}
            />
          ) : (
            <div className="cms-announcements-list">
              {filtered.map((ann) => (
                <Card
                  key={ann.id}
                  hoverable
                  className={`cms-ann-card ${!ann.isRead ? 'is-unread' : ''}`}
                  onClick={() => handleOpenDetail(ann)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge
                          variant={
                            ann.category === 'Exams' || ann.importance === 'High'
                              ? 'error'
                              : ann.category === 'Placement'
                              ? 'warning'
                              : 'info'
                          }
                          size="sm"
                        >
                          {ann.category}
                        </Badge>

                        {ann.importance === 'High' && (
                          <Badge variant="error" size="sm" dot>High Priority</Badge>
                        )}

                        {!ann.isRead && (
                          <span className="cms-new-dot">NEW</span>
                        )}
                      </div>

                      <h3 className="cms-ann-card-title">{ann.title}</h3>
                      <p className="cms-ann-card-desc">{ann.description}</p>
                    </div>

                    <div className="flex flex-col items-end shrink-0 text-xs text-slate-400 gap-1">
                      <span className="flex items-center gap-1 font-medium text-slate-500">
                        <Calendar size={13} /> {ann.date}
                      </span>
                      <span>{ann.time}</span>
                    </div>
                  </div>

                  <div className="cms-ann-card-footer">
                    <span className="cms-ann-posted-by">
                      <User size={13} className="text-slate-400" />
                      Posted by: <strong>{ann.postedBy}</strong>
                    </span>

                    {ann.attachmentName && (
                      <span className="cms-ann-attachment-badge">
                        <FileText size={13} /> {ann.attachmentName} ({ann.attachmentSize})
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={!!selectedAnn}
        onClose={() => setSelectedAnn(null)}
        size="lg"
        title={
          selectedAnn ? (
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-indigo-600" />
              <span>{selectedAnn.category} Circular</span>
            </div>
          ) : undefined
        }
      >
        {selectedAnn && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-3 rounded-md border border-slate-200 text-xs text-slate-600">
              <div>Posted By: <strong>{selectedAnn.postedBy}</strong></div>
              <div>Published: <strong>{selectedAnn.date} at {selectedAnn.time}</strong></div>
            </div>

            <h2 className="text-lg font-bold text-slate-900">{selectedAnn.title}</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{selectedAnn.content}</p>

            {selectedAnn.attachmentName && (
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-indigo-600" />
                  <div>
                    <div className="text-sm font-semibold text-indigo-950">{selectedAnn.attachmentName}</div>
                    <div className="text-xs text-indigo-700">Official Document • {selectedAnn.attachmentSize}</div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Download size={14} />}
                  onClick={() => handleDownloadAttachment(selectedAnn)}
                >
                  Download File
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
