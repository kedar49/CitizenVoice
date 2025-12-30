import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface SubmitQuestionData {
  title: string;
  description: string;
  category_id: number;
}

export function useSubmitQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionData: SubmitQuestionData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('questions')
        .insert([
          {
            ...questionData,
            user_id: user.id,
            status: 'open',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch questions
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
    onError: (error: any) => {
      console.error('Error submitting question:', error);
      throw error;
    },
  });
}
