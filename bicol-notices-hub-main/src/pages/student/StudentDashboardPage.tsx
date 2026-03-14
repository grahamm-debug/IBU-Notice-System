import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Bell, Building2, GraduationCap, Loader2, AlertTriangle, Pin, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StudentLayout from '@/components/student/StudentLayout';
import StudentStatsCards from '@/components/student/StudentStatsCards';
import NoticeCard from '@/components/NoticeCard';
import NoticeDetailModal from '@/components/student/NoticeDetailModal';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

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
  target_departments: string[] | null;
  attachment_url: string | null;
  is_read?: boolean;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

const StudentDashboardNew = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [readNoticeIds, setReadNoticeIds] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    totalNotices: 0,
    unreadCount: 0,
    urgentCount: 0,
    academicCount: 0,
    readPercentage: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch user's department
        if (profile?.department_id) {
          const { data: deptData } = await supabase
            .from('departments')
            .select('*')
            .eq('id', profile.department_id)
            .single();
          if (deptData) setDepartment(deptData);
        }

        // Fetch read notices
        const { data: readData } = await supabase
          .from('notice_reads')
          .select('notice_id')
          .eq('user_id', user.id);

        const readIds = new Set(readData?.map((r) => r.notice_id) || []);
        setReadNoticeIds(readIds);

        // Fetch notices
        const { data: noticesData, count: totalCount } = await supabase
          .from('notices')
          .select('*', { count: 'exact' })
          .eq('is_published', true)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(5);

        if (noticesData) {
          const noticesWithReadStatus = noticesData.map((n) => ({
            ...n,
            is_read: readIds.has(n.id),
          })) as Notice[];
          setNotices(noticesWithReadStatus);
        }

        // Calculate stats
        const { count: urgentTotal } = await supabase
          .from('notices')
          .select('*', { count: 'exact', head: true })
          .eq('is_published', true)
          .eq('notice_type', 'urgent');

        const { count: academicTotal } = await supabase
          .from('notices')
          .select('*', { count: 'exact', head: true })
          .eq('is_published', true)
          .eq('notice_type', 'academic');

        const total = totalCount || 0;
        const readCount = readIds.size;
        const unread = Math.max(0, total - readCount);
        const readPct = total > 0 ? Math.round((readCount / total) * 100) : 0;

        setStats({
          totalNotices: total,
          unreadCount: unread,
          urgentCount: urgentTotal || 0,
          academicCount: academicTotal || 0,
          readPercentage: readPct,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, profile]);

  const markAsRead = async (noticeId: string) => {
    if (!user || readNoticeIds.has(noticeId)) return;

    try {
      await supabase.from('notice_reads').upsert({
        notice_id: noticeId,
        user_id: user.id,
      });
      setReadNoticeIds((prev) => new Set([...prev, noticeId]));
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

  const urgentNotices = notices.filter((n) => n.notice_type === 'urgent');
  const deptNotices = department
    ? notices.filter((n) => n.target_departments?.includes(department.id))
    : [];

  return (
    <StudentLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header with greeting */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-student/20 via-accent/10 to-student/20 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/30">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋
                </h1>
                <p className="text-muted-foreground mt-1">
                  Stay updated with the latest announcements and notices
                </p>
              </div>
              
              {/* Student Info Card */}
              <Card className="bg-secondary/50 border-border/30 w-full md:w-auto">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-student/10 text-student">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {department?.code || 'No Department'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {profile?.year_level
                        ? `${profile.year_level}${
                            profile.year_level === 1
                              ? 'st'
                              : profile.year_level === 2
                              ? 'nd'
                              : profile.year_level === 3
                              ? 'rd'
                              : 'th'
                          } Year`
                        : 'Year not set'}
                      {profile?.batch_year && ` • Batch ${profile.batch_year}`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <StudentStatsCards {...stats} />

        {/* Urgent Notices Banner */}
        {urgentNotices.length > 0 && (
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-destructive/30 to-destructive/10 rounded-2xl blur-xl opacity-50" />
            <Card className="relative bg-destructive/5 border-destructive/30 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-destructive to-destructive/50" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Urgent Notices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {urgentNotices.slice(0, 3).map((notice) => (
                    <div
                      key={notice.id}
                      onClick={() => handleNoticeClick(notice)}
                      className="flex items-center justify-between p-3 bg-card/50 rounded-lg cursor-pointer hover:bg-card/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <span className="font-medium">{notice.title}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(notice.created_at), 'MMM d')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Latest Notices */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-gradient-to-b from-student to-student/50 rounded-full" />
              <h2 className="text-xl font-semibold">Latest Notices</h2>
            </div>
            <Button variant="outline" asChild>
              <a href="/student/notices">View All</a>
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className="absolute inset-0 bg-student/20 rounded-full blur-xl animate-pulse" />
                <Loader2 className="w-8 h-8 animate-spin text-student relative" />
              </div>
            </div>
          ) : notices.length === 0 ? (
            <Card className="bg-card/60 backdrop-blur-sm border-border/30">
              <CardContent className="py-12 text-center">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-student/10 rounded-full blur-xl" />
                  <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4 relative" />
                </div>
                <p className="text-muted-foreground">No notices available yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {notices.map((notice, index) => (
                <div
                  key={notice.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <NoticeCard notice={notice} onClick={() => handleNoticeClick(notice)} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Department Notices Section */}
        {department && deptNotices.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-gradient-to-b from-faculty to-faculty/50 rounded-full" />
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                {department.name} Notices
              </h2>
            </div>
            <div className="grid gap-4">
              {deptNotices.map((notice) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  onClick={() => handleNoticeClick(notice)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notice Detail Modal */}
      <NoticeDetailModal
        notice={selectedNotice}
        isOpen={!!selectedNotice}
        onClose={() => setSelectedNotice(null)}
        isRead={selectedNotice ? readNoticeIds.has(selectedNotice.id) : false}
        onMarkAsRead={() => selectedNotice && markAsRead(selectedNotice.id)}
      />
    </StudentLayout>
  );
};

export default StudentDashboardNew;
