"use client";

import { RoleGuard } from '@/components/auth/RoleGuard';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Shield, 
  Search, 
  Users, 
  UserCog, 
  Crown,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  role: 'citizen' | 'mp_staff' | 'admin';
  created_at: string;
  updated_at: string;
}

function AdminContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'citizen' | 'mp_staff' | 'admin', userEmail: string) => {
    try {
      setUpdating(userId);
      
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      
      toast.success(`Role updated to ${newRole.replace('_', ' ')}`, {
        description: `${userEmail} is now a ${newRole.replace('_', ' ')}`,
      });
      
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update role', {
        description: error.message || 'Please try again',
      });
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: users.length,
    citizens: users.filter(u => u.role === 'citizen').length,
    mpStaff: users.filter(u => u.role === 'mp_staff').length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { label: string; className: string; icon: any }> = {
      admin: { label: 'Admin', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: Crown },
      mp_staff: { label: 'MP Staff', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', icon: UserCog },
      citizen: { label: 'Citizen', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: Users },
    };

    const variant = variants[role];
    const Icon = variant.icon;

    return (
      <Badge className={`${variant.className} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {variant.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-12 w-64 mb-3" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-white/70 dark:bg-slate-900/70">
                <CardContent className="pt-6">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* User List Skeleton */}
          <Card className="bg-white/70 dark:bg-slate-900/70">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-pink-600 dark:from-red-400 dark:to-pink-400">
                Admin Panel
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage user roles and permissions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Be careful when changing user roles. Changes take effect immediately.
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.total, color: 'text-blue-600', icon: Users },
            { label: 'Citizens', value: stats.citizens, color: 'text-sky-600', icon: Users },
            { label: 'MP Staff', value: stats.mpStaff, color: 'text-purple-600', icon: UserCog },
            { label: 'Admins', value: stats.admins, color: 'text-red-600', icon: Crown },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                      <div className={`text-3xl font-bold ${stat.color}`}>
                        {stat.value}
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Search and Actions */}
        <Card className="mb-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-lg">User Management</CardTitle>
              <div className="flex gap-2">
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchUsers}
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  {searchQuery ? 'No users found matching your search.' : 'No users yet.'}
                </div>
              ) : (
                filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {user.email}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-4">
                      {getRoleBadge(user.role)}
                      
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant={user.role === 'citizen' ? 'default' : 'outline'}
                          onClick={() => updateUserRole(user.id, 'citizen', user.email)}
                          disabled={updating === user.id || user.role === 'citizen'}
                          className="text-xs"
                        >
                          Citizen
                        </Button>
                        <Button
                          size="sm"
                          variant={user.role === 'mp_staff' ? 'default' : 'outline'}
                          onClick={() => updateUserRole(user.id, 'mp_staff', user.email)}
                          disabled={updating === user.id || user.role === 'mp_staff'}
                          className="text-xs"
                        >
                          MP Staff
                        </Button>
                        <Button
                          size="sm"
                          variant={user.role === 'admin' ? 'default' : 'outline'}
                          onClick={() => {
                            if (confirm(`Are you sure you want to make ${user.email} an admin?`)) {
                              updateUserRole(user.id, 'admin', user.email);
                            }
                          }}
                          disabled={updating === user.id || user.role === 'admin'}
                          className="text-xs"
                        >
                          Admin
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <AdminContent />
    </RoleGuard>
  );
}
