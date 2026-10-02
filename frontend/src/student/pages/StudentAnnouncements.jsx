import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { Bell, Search, Filter, Calendar, UserCheck } from 'lucide-react';

const categories = ['All', 'Exam', 'Holiday', 'Function', 'Result', 'Leave', 'General'];

export const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/student/announcements');
      setAnnouncements(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const filtered = announcements.filter((ann) => {
    const matchesCategory = selectedCategory === 'All' || ann.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      searchTerm === '' ||
      ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ann.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 rounded-lg" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchAnnouncements} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">Campus Announcements & Circulars</h2>
        <p className="text-xs text-[#64748B]">Official notices, holiday updates, and academic notifications</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-100 text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full md:w-64">
          <Input
            icon={Search}
            placeholder="Search circulars..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Announcements List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No circulars found"
          description="There are no announcements matching your category or search criteria."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((ann) => (
            <div
              key={ann.id}
              className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm hover:border-slate-300 transition-all space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      ann.priority === 'Urgent' || ann.priority === 'High'
                        ? 'error'
                        : ann.category === 'Exam'
                        ? 'primary'
                        : ann.category === 'Holiday'
                        ? 'warning'
                        : 'info'
                    }
                    size="sm"
                  >
                    {ann.category}
                  </Badge>
                  <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                    {ann.publisher}
                  </span>
                </div>
                <span className="text-xs text-[#64748B] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> {ann.date}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#0F172A]">{ann.title}</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">{ann.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentAnnouncements;
