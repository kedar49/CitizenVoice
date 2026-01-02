"use client";

import { useQuestions } from "@/hooks/useQuestions";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { QuestionCardSkeleton } from "@/components/questions/QuestionCardSkeleton";
import { Button } from "@/components/ui/button";
import { Plus, Flame, Users, ChevronDown, SlidersHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { SubmitQuestionForm } from "@/components/questions/SubmitQuestionForm";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterDropdown } from "@/components/search/FilterDropdown";
import { SortDropdown, SortOption } from "@/components/search/SortDropdown";
import { motion } from "framer-motion";
import { useAuth } from "@/providers/AuthProvider";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { sanitizeInput } from "@/lib/sanitize";
import { useCategories } from "@/hooks/useCategories";

export default function Home() {
  const { questions, loading, toggleVote, submitQuestion } = useQuestions();
  const { categories } = useCategories();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('priority');

  const handleNewQuestion = async (data: any) => {
    if (isSubmitting) {
      console.log('Already submitting, ignoring duplicate request');
      return;
    }
    
    console.log('Starting question submission...', data);
    setIsSubmitting(true);
    
    try {
      // Sanitize inputs before submitting
      const sanitizedData = {
        title: sanitizeInput(data.title),
        description: sanitizeInput(data.description),
        category_id: parseInt(data.category) || 1,
      };
      
      console.log('Sanitized data:', sanitizedData);
      await submitQuestion(sanitizedData);
      
      console.log('Question submitted successfully');
      setDialogOpen(false);
      toast.success('Question submitted successfully! 🎉', {
        description: 'Your question is now live and ready for votes.',
      });
    } catch (error: any) {
      console.error('Error submitting question:', error);
      toast.error('Failed to submit question', {
        description: error?.message || 'Please try again or contact support if the problem persists.',
      });
    } finally {
      console.log('Resetting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  const scrollToQuestions = () => {
    document.getElementById('questions-section')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Filter and sort questions
  const filteredQuestions = useMemo(() => {
    let filtered = [...questions];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(query) ||
        (q.description?.toLowerCase().includes(query) ?? false)
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(q => q.category_id === parseInt(selectedCategory));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return b.priority_score - a.priority_score;
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'votes':
          return b.vote_count - a.vote_count;
        case 'trending':
          // Trending = votes in last 7 days (simplified)
          const aAge = Date.now() - new Date(a.created_at).getTime();
          const bAge = Date.now() - new Date(b.created_at).getTime();
          const aScore = a.vote_count / (aAge / 86400000 + 1);
          const bScore = b.vote_count / (bAge / 86400000 + 1);
          return bScore - aScore;
        default:
          return 0;
      }
    });

    return filtered;
  }, [questions, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950">
      
      {/* Compact Hero Section */}
      <section className="relative py-12 md:py-16 px-4 border-b border-stone-200 dark:border-stone-800">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 mb-6">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
                Powered by Citizens
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-6xl font-black text-stone-900 dark:text-white mb-4 tracking-tight leading-tight">
              Your Voice, <span className="text-orange-500">Their Action</span>
            </h1>

            {/* Description */}
            <p className="text-lg text-stone-600 dark:text-stone-400 mb-8 max-w-2xl mx-auto">
              Shape parliamentary discussions. Submit questions, vote on priorities, watch democracy in action.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              {user ? (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="lg" 
                      className="group h-11 px-6 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30 font-semibold"
                    >
                      <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                      Submit Question
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <SubmitQuestionForm 
                      onClose={() => setDialogOpen(false)} 
                      onSubmit={handleNewQuestion}
                      isSubmitting={isSubmitting}
                    />
                  </DialogContent>
                </Dialog>
              ) : (
                <Button 
                  size="lg" 
                  onClick={() => window.location.href = '/auth/signin'}
                  className="h-11 px-6 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30 font-semibold"
                >
                  Get Started
                </Button>
              )}
              
              <button
                onClick={scrollToQuestions}
                className="flex items-center gap-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                <span>View {loading ? '...' : questions.length} Questions</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Compact Stats */}
            {!loading && (
              <div className="flex items-center justify-center gap-6 pt-6 border-t border-stone-200 dark:border-stone-800">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">{questions.length}</div>
                  <div className="text-xs text-stone-600 dark:text-stone-400">Questions</div>
                </div>
                <div className="w-px h-10 bg-stone-200 dark:bg-stone-800" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">
                    {questions.reduce((acc, q) => acc + q.vote_count, 0)}
                  </div>
                  <div className="text-xs text-stone-600 dark:text-stone-400">Votes</div>
                </div>
                <div className="w-px h-10 bg-stone-200 dark:bg-stone-800" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="w-5 h-5 text-orange-500" />
                    <div className="text-2xl font-bold text-orange-500">5K+</div>
                  </div>
                  <div className="text-xs text-stone-600 dark:text-stone-400">Citizens</div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Questions Feed */}
      <section id="questions-section" className="py-10 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-1">
                  Questions
                </h2>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  {filteredQuestions.length} of {questions.length} questions
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <SearchBar 
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search questions..."
                />
                <FilterDropdown
                  label="Category"
                  options={categories.map(cat => ({
                    id: cat.id.toString(),
                    label: cat.name,
                    count: questions.filter(q => q.category_id === cat.id).length
                  }))}
                  selectedId={selectedCategory}
                  onSelect={setSelectedCategory}
                  icon={<SlidersHorizontal className="w-4 h-4" />}
                />
                <SortDropdown value={sortBy} onChange={setSortBy} />
              </div>
            </div>
          </div>

          {loading ? (
            // Skeleton Loading State
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <QuestionCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredQuestions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-stone-50 dark:bg-stone-900/30 rounded-2xl border border-stone-200 dark:border-stone-800"
            >
              <div className="w-14 h-14 rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center mx-auto mb-3">
                <Flame className="w-7 h-7 text-orange-500" />
              </div>
              <p className="text-lg text-stone-900 dark:text-white font-semibold mb-1">
                {searchQuery || selectedCategory ? 'No matching questions' : 'No questions yet'}
              </p>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {searchQuery || selectedCategory ? 'Try adjusting your filters' : 'Be the first to spark a conversation!'}
              </p>
              {(searchQuery || selectedCategory) && (
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {filteredQuestions.map((q, index) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * index }}
                >
                  <QuestionCard question={q} onUpvote={toggleVote} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

    </div>
  );
}
