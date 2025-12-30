import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function useVoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ questionId, userId }: { questionId: number; userId: string }) => {
      // Check if vote exists
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('question_id', questionId)
        .eq('user_id', userId)
        .single();

      if (existingVote) {
        // Remove vote
        await supabase.from('votes').delete().eq('id', existingVote.id);
        return { action: 'removed', questionId };
      } else {
        // Add vote
        await supabase.from('votes').insert([{ question_id: questionId, user_id: userId }]);
        return { action: 'added', questionId };
      }
    },
    onMutate: async ({ questionId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['questions'] });

      // Snapshot previous value
      const previousQuestions = queryClient.getQueryData(['questions']);

      // Optimistically update
      queryClient.setQueryData(['questions'], (old: any) => {
        if (!old) return old;
        return old.map((q: any) =>
          q.id === questionId
            ? {
                ...q,
                vote_count: q.my_vote ? q.vote_count - 1 : q.vote_count + 1,
                my_vote: q.my_vote ? 0 : 1,
              }
            : q
        );
      });

      return { previousQuestions };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousQuestions) {
        queryClient.setQueryData(['questions'], context.previousQuestions);
      }
      toast.error('Failed to update vote', {
        description: 'Please try again',
      });
    },
    onSuccess: (data) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      
      if (data.action === 'added') {
        toast.success('Vote recorded! 🔥');
      }
    },
  });
}
