import { useEffect, useState, useMemo, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { Bell, Loader2, Building2, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StudentLayout from '@/components/student/StudentLayout';
import NoticeCard from '@/components/NoticeCard';
import NoticeFilters from '@/components/student/NoticeFilters';
import NoticeDetailModal from '@/components/student/NoticeDetailModal';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Notice {
  id: string;
  title: string;
  content: string;
  notice_type: 'general' | 'urgent' | 'academic' | 'event';
  priority: string;
  category: string | null;
  publish_date: string | null;
  expire_date: string | null;
  created_at: string;
  is_pinned: boolean;
  attachment_url: string | null;
  target_departments: string[] | null;
  target_blocks: string[] | null;
  target_all: boolean;
  is_read?: boolean;
  read_at?: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

const AllNoticesPage = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [readNoticeIds, setReadNoticeIds] = useState<Set<string>>(new Set());
  const [readTimestamps, setReadTimestamps] = useState<Record<string, string>>({});

  // Filters
// Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [readStatusFilter, setReadStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [blockFilter, setBlockFilter] = useState('all');

  const fetchData = useCallback(async () => {
    if (!user || !profile) return;

    setLoading(true);
    try {
      // Departments (public)
      const { data: deptsData } = await supabase.from('departments').select('*');
      setDepartments(deptsData || []);

      // User's read notices
      const { data: readData } = await supabase
        .from('notice_reads')
        .select('notice_id, read_at')
        .eq('user_id', user.id);

      const readIds = new Set(readData?.map((r) => r.notice_id) || []);
      const timestamps: Record<string, string> = {};
      readData?.forEach((r) => timestamps[r.notice_id] = r.read_at);
      setReadNoticeIds(readIds);
      setReadTimestamps(timestamps);

      // Notices - PURE DB FILTER: target_all OR dept OR enrolled blocks
      const { data: noticesData, error } = await supabase
        .from('notices')
        .select(`
          *,
          notice_reads!notice_reads_user_id_fkey(id)
        `)
        .eq('is_published', true)
        .or(`target_all.eq.true,target_departments.cs.{${profile.department_id}}`)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const noticesWithRead = noticesData?.map((n) => ({
        ...n,
        is_read: !!n.notice_reads?.length,
        read_at: timestamps[n.id] || null,
      })) || [];
      setNotices(noticesWithRead);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [user, profile?.department_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const markAsRead = async (noticeId: string) => {
    if (!user || readNoticeIds.has(noticeId)) return;

    try {
      await supabase.from('notice_reads').upsert({
        notice_id: noticeId,
        user_id: user.id,
      });
      setReadNoticeIds((prev) => new Set([...prev, noticeId]));
      setReadTimestamps((prev) => ({ ...prev, [noticeId]: new Date().toISOString() }));
      setNotices((prev) => prev.map((n) => n.id === noticeId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n));
    } catch (error) {
      console.error('Mark read error:', error);
    }
  };

  const handleNoticeClick = (notice: Notice) => {
    setSelectedNotice(notice);
    markAsRead(notice.id);
  };

  const filteredNotices = useMemo(() => {
    let filtered = notices;

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(q) || 
        n.content?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(n => n.category?.toLowerCase() === categoryFilter.toLowerCase());
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(n => n.priority?.toLowerCase() === priorityFilter.toLowerCase());
    }

    // Block filter
    if (blockFilter !== 'all') {
      filtered = filtered.filter(n => n.target_blocks?.includes(blockFilter));
    }

    // Read status filter
    if (readStatusFilter !== 'all') {
      const isRead = readStatusFilter === 'read';
      filtered = filtered.filter(n => n.is_read === isRead);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === 'priority') {
        const prioA = a.priority || 'normal';
        const prioB = b.priority || 'normal';
        const prioOrder = { critical: 4, high: 3, normal: 2, low: 1 };
        return prioOrder[prioB as keyof typeof prioOrder] - prioOrder[prioA as keyof typeof prioOrder];
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return filtered;
  }, [notices, searchQuery, categoryFilter, priorityFilter, blockFilter, readStatusFilter, sortBy]);

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (!user) return <Navigate to="/student/login" />;

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="bg-card/60 backdrop-blur p-6 rounded-2xl border">
          <h1 className="text-3xl font-bold">All Notices</h1>
          <p className="text-muted-foreground mt-1">Pure DB filtered for your dept/blocks</p>
        </div>

        <NoticeFilters 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          departmentFilter="all"
          onDepartmentChange={() => {}}
          blockFilter={blockFilter}
          onBlockChange={setBlockFilter}
          blocks={[]}
          readStatusFilter={readStatusFilter}
          onReadStatusChange={setReadStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          departments={departments}
          activeFiltersCount={(
            (searchQuery ? 1 : 0) +
            (categoryFilter !== 'all' ? 1 : 0) +
            (priorityFilter !== 'all' ? 1 : 0) +
            (readStatusFilter !== 'all' ? 1 : 0)
          )}
          onClearFilters={() => {
            setSearchQuery('');
            setCategoryFilter('all');
            setPriorityFilter('all');
            setReadStatusFilter('all');
            setSortBy('latest');
            setBlockFilter('all');
          }}
        />

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : filteredNotices.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No notices - you're caught up!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredNotices.map((notice) => (
              <NoticeCard key={notice.id} notice={notice} onClick={() => handleNoticeClick(notice)} />
            ))}
          </div>
        )}

        <NoticeDetailModal
          notice={selectedNotice}
          isOpen={!!selectedNotice}
          onClose={() => setSelectedNotice(null)}
          isRead={!!selectedNotice?.is_read}
          onMarkAsRead={() => selectedNotice && markAsRead(selectedNotice.id)}
        />
      </div>
    </StudentLayout>
  );
};

export default AllNoticesPage;

