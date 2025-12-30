"use client";

import { RoleGuard } from '@/components/auth/RoleGuard';
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Question } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BarChart3, FileCheck, GitMerge, Inbox, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type QuestionStatus = 'open' | 'under_review' | 'merged' | 'implemented';

const COLUMNS: { id: QuestionStatus; title: string; icon: any; color: string }[] = [
  { id: 'open', title: 'Open', icon: Inbox, color: 'bg-blue-500' },
  { id: 'under_review', title: 'Under Review', icon: BarChart3, color: 'bg-amber-500' },
  { id: 'merged', title: 'Merged', icon: GitMerge, color: 'bg-purple-500' },
  { id: 'implemented', title: 'Implemented', icon: FileCheck, color: 'bg-green-500' },
];

function QuestionItem({ question }: { question: Question }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-3 shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-2 line-clamp-2">
        {question.title}
      </h3>
      <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
        {question.description}
      </p>
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-xs">
          {question.categories?.name}
        </Badge>
        <span className="text-xs font-medium text-slate-500">
          {question.vote_count} votes
        </span>
      </div>
    </div>
  );
}

function Column({ status, title, icon: Icon, color, questions }: {
  status: QuestionStatus;
  title: string;
  icon: any;
  color: string;
  questions: Question[];
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 min-h-[500px]">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Icon className="w-4 h-4" />
          {title}
        </h3>
        <span className="ml-auto text-sm text-slate-500">
          {questions.length}
        </span>
      </div>
      
      <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {questions.map(question => (
            <QuestionItem key={question.id} question={question} />
          ))}
        </div>
      </SortableContext>

      {questions.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No questions</p>
        </div>
      )}
    </div>
  );
}

function DashboardContent() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*, categories(id, name, color, icon)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const questionId = active.id as number;
    const newStatus = over.id as QuestionStatus;

    // Update locally first (optimistic)
    setQuestions(prev =>
      prev.map(q => (q.id === questionId ? { ...q, status: newStatus } : q))
    );

    // Update in database
    try {
      const { error } = await supabase
        .from('questions')
        .update({ status: newStatus })
        .eq('id', questionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating question status:', error);
      // Revert on error
      fetchQuestions();
    }
  };

  const getQuestionsByStatus = (status: QuestionStatus) =>
    questions.filter(q => q.status === status);

  const stats = {
    total: questions.length,
    open: getQuestionsByStatus('open').length,
    review: getQuestionsByStatus('under_review').length,
    merged: getQuestionsByStatus('merged').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 mb-2">
            MP Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage and prioritize parliamentary questions
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Questions', value: stats.total, color: 'text-blue-600' },
            { label: 'Open', value: stats.open, color: 'text-amber-600' },
            { label: 'In Review', value: stats.review, color: 'text-purple-600' },
            { label: 'Merged', value: stats.merged, color: 'text-green-600' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50">
                <CardContent className="pt-6">
                  <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {COLUMNS.map(column => (
              <SortableContext
                key={column.id}
                id={column.id}
                items={getQuestionsByStatus(column.id).map(q => q.id)}
                strategy={verticalListSortingStrategy}
              >
                <Column
                  status={column.id}
                  title={column.title}
                  icon={column.icon}
                  color={column.color}
                  questions={getQuestionsByStatus(column.id)}
                />
              </SortableContext>
            ))}
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-2xl opacity-90 rotate-3">
                {questions.find(q => q.id === activeId)?.title}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RoleGuard allowedRoles={['mp_staff', 'admin']}>
      <DashboardContent />
    </RoleGuard>
  );
}
