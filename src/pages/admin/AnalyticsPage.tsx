

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, FileText, Users, Eye, TrendingUp } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import StatsCard from '@/components/admin/StatsCard';
import NoticesChart from '@/components/admin/NoticesChart';
import apiClient from '@/integrations/api/client';

interface AnalyticsData {

  totalNotices: number;
  publishedNotices: number;
  draftNotices: number;
  totalReads: number;
  readRate: number;
  totalUsers: number;
  activeUsers: number;
}

const AnalyticsPage = () => {
  const [data, setData] = useState<AnalyticsData>({
    totalNotices: 0,
    publishedNotices: 0,
    draftNotices: 0,
    totalReads: 0,
    readRate: 0,
    totalUsers: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setError(null);
      const analytics = await apiClient.stats.analytics();

      setData({
        totalNotices: analytics.totalNotices,
        publishedNotices: analytics.publishedNotices,
        draftNotices: analytics.draftNotices,
        totalReads: analytics.totalReads,
        readRate: analytics.readRate,
        totalUsers: analytics.totalUsers,
        activeUsers: analytics.activeUsers,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errMsg);
      toast({
        variant: "destructive",
        title: "Analytics Load Failed",
        description: errMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics & Reports</h1>
          <p className="text-muted-foreground">
            Insights and statistics about the notice system
          </p>
        </div>

        {/* Stats */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to load analytics</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Notices"
              value={data.totalNotices}
              subtitle={`${data.publishedNotices} published, ${data.draftNotices} drafts`}
              icon={FileText}
              variant="primary"
            />
            <StatsCard
              title="Total Reads"
              value={data.totalReads}
              icon={Eye}
              variant="success"
            />
            <StatsCard
              title="Read Rate"
              value={`${data.readRate}%`}
              subtitle="Average engagement"
              icon={TrendingUp}
              variant="warning"
            />
            <StatsCard
              title="Active Users"
              value={data.activeUsers}
              subtitle={`of ${data.totalUsers} total`}
              icon={Users}
              variant="default"
            />
          </div>
        )}

        {/* Charts */}
        <NoticesChart />

        {/* Additional Stats */}

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Notice Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Published</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{
                          width: `${(data.publishedNotices / data.totalNotices) * 100 || 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">{data.publishedNotices}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Drafts</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-muted-foreground rounded-full"
                        style={{
                          width: `${(data.draftNotices / data.totalNotices) * 100 || 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">{data.draftNotices}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Active Users</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${(data.activeUsers / data.totalUsers) * 100 || 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">{data.activeUsers}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Inactive Users</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-muted-foreground rounded-full"
                        style={{
                          width: `${((data.totalUsers - data.activeUsers) / data.totalUsers) * 100 || 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {data.totalUsers - data.activeUsers}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsPage;
