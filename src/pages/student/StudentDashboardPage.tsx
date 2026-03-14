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
import apiClient from '@/integrations/api/client';
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

interface Enrollment {
  program: string;
  block: string;
  year_level: number;
  section: string;
}

const StudentDashboardNew = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [department, setDepartment] = useState<Department | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
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
          try {
            const departments = await apiClient.departments.list();
            const deptData = departments.find(d => d.id === profile.department_id);
            if (deptData) setDepartment(deptData);
          } catch (error) {
            console.error('Error fetching department:', error);
          }
        }

        // Fetch enrollment (course/block)
        if (profile?.student_id) {
          try {
            const enrollData = await apiClient.students.enrollment(profile.student_id);
            setEnrollment(enrollData);
          } catch (error) {
            console.error('Error fetching enrollment:', error);
            setEnrollment(null);
          }
        }

        // Fetch read notices - after fetching notices first
        // Will be handled after notices fetch

        // Fetch notices - MySQL API
        const noticesParams = { 
          department_id: profile?.department_id,
          ...(enrollment && { block_id: enrollment.block }),
          status: 'A'
        };
        const noticesData: any[] = await apiClient.notices.list(noticesParams);
        
        let readIdsSet = new Set<string>();
        if (noticesData && noticesData.length > 0) {
          // Get read status for these notices
          const noticeIds = noticesData.map((n: any) => n.id).join(',');
          const readData: any = await apiClient.noticeReads.getBulk(noticeIds);
          readIdsSet = new Set((readData as any[]).map((r: any) => r.notice_id.toString()));
          
            const noticesWithReadStatus = noticesData
              .sort((a: any, b: any) => Number(b.is_pinned) - Number(a.is_pinned) || b.created_at.localeCompare(a.created_at))
              .map((n: any) => ({
                ...n,
                is_read: readIdsSet.has(n.id.toString()),
                notice_type: n.category?.toLowerCase() as any || 'general',
                priority: (n.priority || 'normal').toLowerCase() as any,
              })) as Notice[];
          setNotices(noticesWithReadStatus.slice(0, 5));
          setReadNoticeIds(readIdsSet);
        }

        // Calculate stats client-side from noticesData or allNotices
        const allNoticesParams = { status: 'A' };  // All for stats
        const allNotices: any[] = await apiClient.notices.list(allNoticesParams);
        const total = allNotices.length || 0;
        const urgentTotal = allNotices.filter((n: any) => ['Urgent'].includes(n.priority)).length || 0;
        const academicTotal = allNotices.filter((n: any) => ['Exam','Class'].includes(n.category)).length || 0;
        const readCount = readIdsSet.size;
        const unread = Math.max(0, total - readCount);
        const readPct = total > 0 ? Math.round((readCount / total) * 100) : 0;
        console.log('Dashboard stats:', { total, urgentTotal, academicTotal, readCount, profile }); // DEBUG

        setStats({
          totalNotices: total,
          unreadCount: unread,
          urgentCount: urgentTotal,
          academicCount: academicTotal,
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

  const markAsRead = async (noticeId: string | number) => {
    const idStr = noticeId.toString();
    if (!user || readNoticeIds.has(idStr)) return;

    try {
      await apiClient.noticeReads.markAsRead(parseInt(idStr));
      setReadNoticeIds((prev) => new Set([...Array.from(prev), idStr]));
      setNotices((prev) =>
        prev.map((n) => (n.id.toString() === idStr ? { ...n, is_read: true } : n))
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

  const urgentNotices = notices.filter((n) => ['high', 'critical'].includes(n.priority?.toLowerCase() || ''));
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
                      {enrollment?.block || 'No Block Assigned'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {enrollment 
                        ? `(${enrollment.program} - ${enrollment.year_level}${
                            enrollment.year_level === 1 ? 'st' :
                            enrollment.year_level === 2 ? 'nd' :
                            enrollment.year_level === 3 ? 'rd' : 'th'
                          } Year ${enrollment.section})`
                        : 'Enrollment not found'
                      }
                      {department?.code && ` • ${department.code}`}
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
