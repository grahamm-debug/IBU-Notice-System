import { ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

interface StudentLayoutProps {
  children: ReactNode;
}

interface Notification {
  id: string;
  title: string;
  time: string;
  isUrgent: boolean;
}

const StudentLayout = ({ children }: StudentLayoutProps) => {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [urgentCount, setUrgentCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchCounts = async () => {
      // Fetch urgent notices count
      const { count: urgentTotal } = await supabase
        .from('notices')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)
        .eq('notice_type', 'urgent');

      setUrgentCount(urgentTotal || 0);

      // Fetch read notices for this user
      const { data: readNotices } = await supabase
        .from('notice_reads')
        .select('notice_id')
        .eq('user_id', user.id);

      const readIds = readNotices?.map((r) => r.notice_id) || [];

      // Fetch total published notices
      const { count: totalNotices, data: allNotices } = await supabase
        .from('notices')
        .select('*', { count: 'exact' })
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(10);

      const unread = (totalNotices || 0) - readIds.length;
      setUnreadCount(Math.max(0, unread));

      // Create notifications from recent notices
      if (allNotices) {
        const recentNotifications: Notification[] = allNotices
          .filter((n) => !readIds.includes(n.id))
          .slice(0, 5)
          .map((n) => ({
            id: n.id,
            title: n.title,
            time: formatDistanceToNow(new Date(n.created_at), { addSuffix: true }),
            isUrgent: n.notice_type === 'urgent',
          }));
        setNotifications(recentNotifications);
      }
    };

    fetchCounts();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('notices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notices',
        },
        () => {
          fetchCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-student/5">
        <Loader2 className="w-8 h-8 animate-spin text-student" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-student/5">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-student/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-1/2 -left-20 w-60 h-60 bg-accent/10 rounded-full blur-3xl animate-float-medium" />
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-student/5 rounded-full blur-3xl animate-float-fast" />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-card/95 backdrop-blur-xl">
          <StudentSidebar
            urgentCount={urgentCount}
            unreadCount={unreadCount}
            collapsed={false}
            onToggle={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <StudentSidebar
          urgentCount={urgentCount}
          unreadCount={unreadCount}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300',
          collapsed ? 'lg:ml-20' : 'lg:ml-72'
        )}
      >
        <StudentHeader
          studentName={profile?.full_name || 'Student'}
          avatarUrl={profile?.avatar_url || undefined}
          urgentCount={urgentCount}
          notifications={notifications}
          onSignOut={handleSignOut}
          onMenuClick={() => setMobileOpen(true)}
          showMenuButton
        />

        <main className="p-4 lg:p-8 relative z-10">{children}</main>
      </div>
    </div>
  );
};

export default StudentLayout;
