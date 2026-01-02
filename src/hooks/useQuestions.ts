import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Question } from '@/types';

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('questions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'questions' },
        () => {
          fetchQuestions(); // Refetch on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchQuestions = async () => {
    try {
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
      const { data: { user } } = await supabase.auth.getUser();
      const transformedData = data?.map((q: any) => ({
        ...q,
        my_vote: q.votes?.some((v: any) => v.user_id === user?.id) ? 1 : 0,
      })) || [];

      setQuestions(transformedData);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const submitQuestion = async (questionData: {
    title: string;
    description: string;
    category_id: number;
  }) => {
    console.log('[useQuestions] Starting submitQuestion...', { questionData });
    
    try {
      // Check authentication with timeout
      const authPromise = supabase.auth.getUser();
      const { data: { user } } = await Promise.race([
        authPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Authentication check timed out after 10 seconds')), 10000)
        )
      ]) as Awaited<typeof authPromise>;

      if (!user) {
        console.error('[useQuestions] User not authenticated');
        throw new Error('You must be logged in to submit a question');
      }

      console.log('[useQuestions] User authenticated:', user.id);

      // Insert question with timeout
      const insertPromise = supabase
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

      const { data, error } = await Promise.race([
        insertPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Question submission timed out after 15 seconds. Please check your internet connection and try again.')), 15000)
        )
      ]) as Awaited<typeof insertPromise>;

      if (error) {
        console.error('[useQuestions] Supabase error:', error);
        
        // Provide more helpful error messages
        if (error.code === '23505') {
          throw new Error('This question has already been submitted');
        } else if (error.code === '42501') {
          throw new Error('Permission denied. Please check your account permissions.');
        } else if (error.message.includes('network')) {
          throw new Error('Network error. Please check your internet connection.');
        }
        
        throw new Error(error.message || 'Failed to submit question');
      }

      console.log('[useQuestions] Question submitted successfully:', data);
      return data;
    } catch (error: any) {
      console.error('[useQuestions] submitQuestion failed:', error);
      
      // Re-throw with more context
      if (error.message) {
        throw error;
      } else {
        throw new Error('An unexpected error occurred while submitting your question');
      }
    }
  };

  const toggleVote = async (questionId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if vote exists
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('question_id', questionId)
      .eq('user_id', user.id)
      .single();

    if (existingVote) {
      // Remove vote
      await supabase
        .from('votes')
        .delete()
        .eq('id', existingVote.id);
    } else {
      // Add vote
      await supabase
        .from('votes')
        .insert([
          {
            question_id: questionId,
            user_id: user.id,
          },
        ]);
    }

    // Refetch to get updated counts
    fetchQuestions();
  };

  return {
    questions,
    loading,
    error,
    submitQuestion,
    toggleVote,
    refetch: fetchQuestions,
  };
}
