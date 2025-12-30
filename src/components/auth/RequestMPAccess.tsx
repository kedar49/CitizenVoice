"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { UserCog, Loader2, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { useUserRole } from '@/hooks/useUserRole';
import { useEffect } from 'react';
import { ensureUserProfile } from '@/lib/ensureUserProfile';

interface RoleRequest {
  id: number;
  requested_role: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export function RequestMPAccess() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingRequest, setExistingRequest] = useState<RoleRequest | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && open) {
      checkExistingRequest();
    }
  }, [user, open]);

  const checkExistingRequest = async () => {
    try {
      const { data, error } = await supabase
        .from('role_requests')
        .select('*')
        .eq('user_id', user!.id)
        .eq('requested_role', 'mp_staff')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && data.status === 'pending') {
        setExistingRequest(data);
      } else {
        setExistingRequest(null);
      }
    } catch (error) {
      // It's ok if no request exists
      setExistingRequest(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Ensure user profile exists first
      const profileResult = await ensureUserProfile(user!.id, user!.email!);
      
      if (!profileResult.success) {
        throw new Error('Failed to create user profile. Please try signing out and back in.');
      }

      // Now submit the role request
      const { error: requestError } = await supabase
        .from('role_requests')
        .insert({
          user_id: user!.id,
          requested_role: 'mp_staff',
          reason,
          status: 'pending'
        });

      if (requestError) throw requestError;

      setOpen(false);
      setReason('');
      checkExistingRequest();
      
      // Show success message
      setTimeout(() => {
        alert('Your request has been submitted! An admin will review it soon.');
      }, 100);
    } catch (error: any) {
      console.error('Error submitting request:', error);
      setError(error.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (role !== 'citizen') return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-orange-200 dark:border-orange-900 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30"
        >
          <UserCog className="w-4 h-4" />
          Request MP Access
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <UserCog className="w-6 h-6 text-orange-500" />
            Request MP Staff Access
          </DialogTitle>
        </DialogHeader>

        {existingRequest ? (
          <div className="py-6 text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-orange-100 dark:bg-orange-950/30">
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">
              Request Pending
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
              Your request is being reviewed by an administrator.
            </p>
            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300">
              Submitted {new Date(existingRequest.created_at).toLocaleDateString()}
            </Badge>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}
            
            <div>
              <Label htmlFor="reason" className="text-stone-900 dark:text-white font-medium mb-2 block">
                Why do you want MP Staff access?
              </Label>
              <Textarea
                id="reason"
                placeholder="Explain why you need MP Staff privileges and how you plan to use them..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows={5}
                className="resize-none border-stone-200 dark:border-stone-800 focus:border-orange-500"
              />
              <p className="text-xs text-stone-500 mt-2">
                Admin will review your request and respond within 24-48 hours.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || !reason.trim()}
              className="w-full h-11 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
