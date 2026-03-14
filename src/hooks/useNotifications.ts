import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type Notice = Database['public']['Tables']['notices']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type AppRole = Database['public']['Enums']['app_role'];

export interface Notification {
  id: string;
  title: string;
  content: string;
  priority: string;
  category: string | null;
  created_at: string;
  isUrgent: boolean;
  time: string;
  is_read: boolean;
}

export const useNotifications = () => {
  const { user, profile, role } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [urgentCount, setUrgentCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useState<any>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user || !profile || !role) return;

    setLoading(true);
    try {
      let query = supabase
        .from('notices')
        .select(`
          *,
          notice_reads!inner(id)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(10);

      // Role-specific filtering
      if (role === 'student') {
        // Filter by department or user's enrolled blocks
        if (profile.department_id) {
          query = query.or(`target_departments.cs.{${profile.department_id}}`);
        }
        query = query.eq('target_all', true);
      } else if (role === 'faculty') {
        // Faculty: own notices + department notices
        query = query.or(`author_id.eq.${user.id},target_departments.cs.{${profile.department_id}}`);
        query = query.eq('target_all', true);
      } // admin sees all

      const { data: noticesData, count } = await query;

      if (noticesData) {
        const notificationsList: Notification[] = noticesData.map((notice: any) => ({
          id: notice.id,
          title: notice.title,
          content: notice.content,
          priority: notice.priority,
          category: notice.category,
          created_at: notice.created_at,
          isUrgent: notice.priority === 'high' || notice.priority === 'critical',
          time: new Date(notice.created_at).toLocaleString(),
          is_read: notice.notice_reads?.length > 0 || false,
        }));

        setNotifications(notificationsList.slice(0, 5));
        setUnreadCount(noticesData.filter((n: any) => !n.notice_reads?.length).length);
        setUrgentCount(noticesData.filter((n: any) => (n.priority === 'high' || n.priority === 'critical') && !n.notice_reads?.length).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user, profile, role]);

  useEffect(() => {
    fetchNotifications();

    // Cleanup previous channel
    if (channel) {
      supabase.removeChannel(channel);
    }

    // Realtime subscription for new notices
    if (user && role) {
      const newChannel = supabase
        .channel('notices')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notices',
            filter: 'is_published=eq.true',
          },
          () => fetchNotifications()
        )
        .subscribe();

      setChannel(newChannel);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchNotifications]);

  const refresh = fetchNotifications;

  return {
    notifications,
    urgentCount,
    unreadCount,
    loading,
    refresh,
  };
};

