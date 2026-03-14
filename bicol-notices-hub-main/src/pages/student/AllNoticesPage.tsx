import { useEffect, useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { Bell, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
  priority: 'low' | 'normal' | 'high' | 'critical';
  category: 'exam' | 'events' | 'class' | 'general' | null;
  publish_date: string | null;
  expire_date: string | null;
  created_at: string;
  is_pinned: boolean;
  attachment_url: string | null;
  target_departments: string[] | null;
  is_read?: boolean;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

const AllNoticesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [readNoticeIds, setReadNoticeIds] = useState<Set<string>>(new Set());
  const [readTimestamps, setReadTimestamps] = useState<Record<string, string>>({});

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [readStatusFilter, setReadStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch departments
        const { data: deptsData } = await supabase.from('departments').select('*');
        if (deptsData) setDepartments(deptsData);

        // Fetch read notices
        const { data: readData } = await supabase
          .from('notice_reads')
          .select('notice_id, read_at')
          .eq('user_id', user.id);

        const readIds = new Set(readData?.map((r) => r.notice_id) || []);
        const timestamps: Record<string, string> = {};
        readData?.forEach((r) => {
          timestamps[r.notice_id] = r.read_at;
        });
        setReadNoticeIds(readIds);
        setReadTimestamps(timestamps);

        // Fetch all notices
        const { data: noticesData } = await supabase
          .from('notices')
          .select('*')
          .eq('is_published', true)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });

        if (noticesData) {
          const noticesWithReadStatus = noticesData.map((n) => ({
            ...n,
            is_read: readIds.has(n.id),
          })) as Notice[];
          setNotices(noticesWithReadStatus);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const markAsRead = async (noticeId: string) => {
    if (!user || readNoticeIds.has(noticeId)) return;

    try {
      const now = new Date().toISOString();
      await supabase.from('notice_reads').upsert({
        notice_id: noticeId,
        user_id: user.id,
      });
      setReadNoticeIds((prev) => new Set([...prev, noticeId]));
      setReadTimestamps((prev) => ({ ...prev, [noticeId]: now }));
      setNotices((prev) =>
        prev.map((n) => (n.id === noticeId ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notice as read:', error);
    }
  };

  const handleNoticeClick = (notice: Notice) => {
    setSelectedNotice(notice);
    markAsRead(notice.id);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (categoryFilter !== 'all') count++;
    if (priorityFilter !== 'all') count++;
    if (departmentFilter !== 'all') count++;
    if (readStatusFilter !== 'all') count++;
    return count;
  }, [categoryFilter, priorityFilter, departmentFilter, readStatusFilter]);

  const clearFilters = () => {
    setCategoryFilter('all');
    setPriorityFilter('all');
    setDepartmentFilter('all');
    setReadStatusFilter('all');
    setSearchQuery('');
  };

  const filteredNotices = useMemo(() => {
    let filtered = [...notices];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.content.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((n) => n.category === categoryFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter((n) => n.priority === priorityFilter);
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(
        (n) =>
          n.target_departments?.includes(departmentFilter) ||
          n.target_departments === null ||
          n.target_departments?.length === 0
      );
    }

    // Read status filter
    if (readStatusFilter === 'read') {
      filtered = filtered.filter((n) => readNoticeIds.has(n.id));
    } else if (readStatusFilter === 'unread') {
      filtered = filtered.filter((n) => !readNoticeIds.has(n.id));
    }

    // Sorting
    if (sortBy === 'oldest') {
      filtered.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (sortBy === 'priority') {
      const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
      filtered.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );
    }

    return filtered;
  }, [
    notices,
    searchQuery,
    categoryFilter,
    priorityFilter,
    departmentFilter,
    readStatusFilter,
    sortBy,
    readNoticeIds,
  ]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/student/login" replace />;
  }

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-student/20 via-accent/10 to-student/20 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/30">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              All Notices
            </h1>
            <p className="text-muted-foreground mt-1">
              Browse and filter all available notices
            </p>
          </div>
        </div>

        {/* Filters */}
        <NoticeFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          departmentFilter={departmentFilter}
          onDepartmentChange={setDepartmentFilter}
          readStatusFilter={readStatusFilter}
          onReadStatusChange={setReadStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          departments={departments}
          activeFiltersCount={activeFiltersCount}
          onClearFilters={clearFilters}
        />

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredNotices.length} of {notices.length} notices
        </div>

        {/* Notices List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="relative">
              <div className="absolute inset-0 bg-student/20 rounded-full blur-xl animate-pulse" />
              <Loader2 className="w-8 h-8 animate-spin text-student relative" />
            </div>
          </div>
        ) : filteredNotices.length === 0 ? (
          <Card className="bg-card/60 backdrop-blur-sm border-border/30">
            <CardContent className="py-12 text-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-student/10 rounded-full blur-xl" />
                <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4 relative" />
              </div>
              <p className="text-muted-foreground">No notices match your filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredNotices.map((notice, index) => (
              <div
                key={notice.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <NoticeCard notice={notice} onClick={() => handleNoticeClick(notice)} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notice Detail Modal */}
      <NoticeDetailModal
        notice={selectedNotice}
        isOpen={!!selectedNotice}
        onClose={() => setSelectedNotice(null)}
        isRead={selectedNotice ? readNoticeIds.has(selectedNotice.id) : false}
        readAt={selectedNotice ? readTimestamps[selectedNotice.id] : null}
        onMarkAsRead={() => selectedNotice && markAsRead(selectedNotice.id)}
      />
    </StudentLayout>
  );
};

export default AllNoticesPage;
