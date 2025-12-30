import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Question } from '@/types';
import { useEffect } from 'react';

export function useQuestionsQuery() {
  const query = useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          categories (id, name, color, icon),
          votes (id, user_id)
        `)
        .order('priority_score', { ascending: false });

      if (error) throw error;

      // Transform data to include my_vote
      const transformedData = data?.map((q: any) => ({
        ...q,
        my_vote: q.votes?.some((v: any) => v.user_id === user?.id) ? 1 : 0,
      })) || [];

      return transformedData as Question[];
    },
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Background refetch every minute
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('questions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'questions' },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [query]);

  return query;
}
