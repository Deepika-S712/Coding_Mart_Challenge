import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Award, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { facultyApi } from '../api/facultyApi';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { TableSkeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/ErrorState';

export function SubjectsPage() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await facultyApi.getSubjects();
      if (res.success && res.data) {
        setSubjects(res.data);
      } else {
        throw new Error(res.message || 'Failed to load subjects');
      }
    } catch (err) {
      setError(err.message || 'Error fetching assigned subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  if (loading) return <TableSkeleton rows={4} columns={3} />;
  if (error) return <ErrorState title="Error Loading Subjects" message={error} onRetry={fetchSubjects} />;

  return (
    <div>
      <div className="cms-page-header">
        <div>
          <h1 className="cms-page-title">My Assigned Subjects</h1>
          <p className="cms-page-subtitle">
            Curriculum courses and allocated batches for current academic semester
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {subjects.map((sub) => (
          <Card key={sub.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cms-primary)', backgroundColor: 'var(--cms-primary-light)', padding: '2px 8px', borderRadius: '4px' }}>
                  {sub.code}
                </span>
                <Badge variant="primary">{sub.credits} Credits</Badge>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--cms-text-primary)', marginBottom: '6px' }}>
                {sub.name}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--cms-text-secondary)', marginBottom: '16px' }}>
                {sub.department} • Semester {sub.semester}
              </p>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '13px', color: 'var(--cms-text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={16} color="var(--cms-text-muted)" />
                  <span>{sub.totalStudents} Enrolled</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={16} color="var(--cms-text-muted)" />
                  <span>Classes: {sub.assignedClasses.join(', ')}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--cms-text-secondary)' }}>Syllabus Completion</span>
                  <span style={{ fontWeight: 600, color: 'var(--cms-text-primary)' }}>{sub.syllabusProgress}%</span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'var(--cms-bg-muted)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${sub.syllabusProgress}%`,
                      backgroundColor: 'var(--cms-primary)',
                      borderRadius: '3px'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--cms-border-subtle)', paddingTop: '16px' }}>
              <Button
                variant="outline"
                size="sm"
                style={{ flex: 1 }}
                onClick={() => navigate('/faculty/students')}
              >
                Students
              </Button>
              <Button
                variant="primary"
                size="sm"
                style={{ flex: 1 }}
                onClick={() => navigate(`/faculty/attendance?subjectCode=${sub.code}`)}
              >
                Attendance
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
