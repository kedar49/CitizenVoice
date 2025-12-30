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
