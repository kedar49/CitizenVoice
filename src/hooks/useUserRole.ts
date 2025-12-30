import { useAuth } from '@/providers/AuthProvider';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export type UserRole = 'citizen' | 'mp_staff' | 'admin';

interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage after mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('user_role');
      if (cached && !role) {
        setRole(cached as UserRole);
      }
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setProfile(null);
      setLoading(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user_role');
      }
      return;
    }

    fetchUserRole();
  }, [user]);

  const fetchUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setRole(data.role as UserRole);
      
      // Cache role in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_role', data.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole('citizen'); // Default to citizen on error
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_role', 'citizen');
      }
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!role) return false;
    
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(role);
  };

  const isAdmin = () => role === 'admin';
  const isMPStaff = () => role === 'mp_staff' || role === 'admin';
  const isCitizen = () => role === 'citizen';

  return {
    role,
    profile,
    loading,
    hasRole,
    isAdmin,
    isMPStaff,
    isCitizen,
  };
}
