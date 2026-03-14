import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import apiClient from '@/integrations/api/client';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface DepartmentData {
  name: string;
  notices: number;
}

interface Notice {
  category: string | null;
  target_departments: string[] | null;
}

interface Department {
  id: number;
  code: string;
  name: string;
}

const CATEGORY_COLORS = {
  exam: 'hsl(217, 91%, 60%)',
  events: 'hsl(142, 76%, 36%)',
  class: 'hsl(262, 83%, 58%)',
  general: 'hsl(215, 16%, 47%)',
};

const NoticesChart = () => {
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch notices for category breakdown
        const notices = await apiClient.notices.list();
        const departments = await apiClient.departments.list();

        if (notices && notices.length > 0) {
          // Category breakdown
          const categoryCount: Record<string, number> = {
            exam: 0,
            events: 0,
            class: 0,
            general: 0,
          };

          (notices as Notice[]).forEach((notice) => {
            const cat = notice.category || 'general';
            if (categoryCount[cat] !== undefined) {
              categoryCount[cat]++;
            }
          });

          setCategoryData([
            { name: 'Exam', value: categoryCount.exam, color: CATEGORY_COLORS.exam },
            { name: 'Events', value: categoryCount.events, color: CATEGORY_COLORS.events },
            { name: 'Class', value: categoryCount.class, color: CATEGORY_COLORS.class },
            { name: 'General', value: categoryCount.general, color: CATEGORY_COLORS.general },
          ]);
        }

        // Fetch departments for engagement
        if (departments && notices && notices.length > 0) {
          const deptNoticeCount: Record<string, number> = {};
          
          (departments as Department[]).forEach((dept) => {
            deptNoticeCount[dept.code] = 0;
          });

          (notices as Notice[]).forEach((notice) => {
            if (notice.target_departments) {
              notice.target_departments.forEach((deptId: string) => {
                const dept = (departments as Department[]).find((d) => String(d.id) === deptId);
                if (dept) {
                  deptNoticeCount[dept.code] = (deptNoticeCount[dept.code] || 0) + 1;
                }
              });
            }
          });

          setDepartmentData(
            Object.entries(deptNoticeCount).map(([name, notices]) => ({
              name,
              notices,
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalNotices = categoryData.reduce((sum, cat) => sum + cat.value, 0);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Category Pie Chart */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Notices by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
          ) : totalNotices === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No notices data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Department Bar Chart */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Department Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
          ) : departmentData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No department data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar 
                  dataKey="notices" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NoticesChart;

