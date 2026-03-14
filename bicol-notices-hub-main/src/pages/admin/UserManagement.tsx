import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCog,
  Mail,
  Shield,
  GraduationCap,
  Users as UsersIcon,
  Loader2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  department_id: string | null;
  year_level: number | null;
  batch_year: number | null;
  status: string;
  last_login: string | null;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: 'student' | 'faculty' | 'admin';
}

interface Department {
  id: string;
  code: string;
  name: string;
}

const roleColors: Record<string, string> = {
  student: 'bg-student/10 text-student border-student/20',
  faculty: 'bg-faculty/10 text-faculty border-faculty/20',
  admin: 'bg-admin/10 text-admin border-admin/20',
};

const roleIcons: Record<string, React.ElementType> = {
  student: GraduationCap,
  faculty: UsersIcon,
  admin: Shield,
};

const UserManagement = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    role: 'student' as 'student' | 'faculty' | 'admin',
    departmentId: '',
    batchYear: '',
    status: 'active',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profilesRes, rolesRes, deptsRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('*'),
        supabase.from('departments').select('*'),
      ]);

      if (profilesRes.data) setProfiles(profilesRes.data as UserProfile[]);
      if (rolesRes.data) setUserRoles(rolesRes.data as UserRole[]);
      if (deptsRes.data) setDepartments(deptsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserRole = (userId: string) => {
    return userRoles.find((r) => r.user_id === userId)?.role || 'student';
  };

  const getDepartmentName = (deptId: string | null) => {
    if (!deptId) return '-';
    const dept = departments.find((d) => d.id === deptId);
    return dept?.code || '-';
  };

  const generateUserId = (role: string, index: number) => {
    const prefix = role === 'admin' ? 'ADM' : role === 'faculty' ? 'FAC' : 'STU';
    return `${prefix}-${String(index + 1).padStart(6, '0')}`;
  };

  const handleUpdateStatus = async (profile: UserProfile, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', profile.id);

      if (error) throw error;
      
      setProfiles(profiles.map((p) =>
        p.id === profile.id ? { ...p, status: newStatus } : p
      ));
      toast({ title: `User ${newStatus === 'active' ? 'activated' : 'deactivated'}` });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'student' | 'faculty' | 'admin') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;
      
      setUserRoles(userRoles.map((r) =>
        r.user_id === userId ? { ...r, role: newRole } : r
      ));
      toast({ title: `Role updated to ${newRole}` });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  const handleEditUser = (profile: UserProfile) => {
    const role = getUserRole(profile.user_id);
    setFormData({
      email: profile.email,
      fullName: profile.full_name || '',
      password: '',
      role,
      departmentId: profile.department_id || '',
      batchYear: profile.batch_year?.toString() || '',
      status: profile.status,
    });
    setEditingUser(profile);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    setSaving(true);
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          department_id: formData.departmentId || null,
          batch_year: formData.batchYear ? parseInt(formData.batchYear) : null,
          status: formData.status,
        })
        .eq('id', editingUser.id);

      if (profileError) throw profileError;

      await handleUpdateRole(editingUser.user_id, formData.role);
      
      setProfiles(profiles.map((p) =>
        p.id === editingUser.id
          ? {
              ...p,
              full_name: formData.fullName,
              department_id: formData.departmentId || null,
              batch_year: formData.batchYear ? parseInt(formData.batchYear) : null,
              status: formData.status,
            }
          : p
      ));

      setEditingUser(null);
      toast({ title: 'User updated successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredProfiles = profiles.filter((profile) => {
    const role = getUserRole(profile.user_id);
    const matchesSearch =
      profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || role === roleFilter;
    const matchesDept = departmentFilter === 'all' || profile.department_id === departmentFilter;
    const matchesStatus = statusFilter === 'all' || profile.status === statusFilter;

    return matchesSearch && matchesRole && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage all system users and their roles</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>User ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8}>
                    <div className="h-12 animate-pulse bg-muted rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredProfiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <UsersIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No users found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredProfiles.map((profile, index) => {
                const role = getUserRole(profile.user_id);
                const RoleIcon = roleIcons[role] || GraduationCap;

                return (
                  <TableRow key={profile.id} className="group">
                    <TableCell className="font-mono text-sm">
                      {generateUserId(role, index)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-9 h-9 rounded-full flex items-center justify-center',
                          roleColors[role]
                        )}>
                          <RoleIcon className="w-4 h-4" />
                        </div>
                        <span className="font-medium">
                          {profile.full_name || 'Unknown'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {profile.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('capitalize', roleColors[role])}>
                        {role}
                      </Badge>
                    </TableCell>
                    <TableCell>{getDepartmentName(profile.department_id)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          profile.status === 'active'
                            ? 'bg-green-500/10 text-green-600 border-green-500/20'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {profile.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(profile.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditUser(profile)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserCog className="w-4 h-4 mr-2" />
                            View Activity
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(
                                profile,
                                profile.status === 'active' ? 'inactive' : 'active'
                              )
                            }
                          >
                            {profile.status === 'active' ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Edit User Modal */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and permissions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={formData.email} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'student' | 'faculty' | 'admin') =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={formData.departmentId}
                onValueChange={(value) =>
                  setFormData({ ...formData, departmentId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.role === 'student' && (
              <div className="space-y-2">
                <Label>Batch Year</Label>
                <Input
                  type="number"
                  value={formData.batchYear}
                  onChange={(e) =>
                    setFormData({ ...formData, batchYear: e.target.value })
                  }
                  placeholder="e.g. 2024"
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <Label>Active Status</Label>
              <Switch
                checked={formData.status === 'active'}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, status: checked ? 'active' : 'inactive' })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
