"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowBigUp, Clock, MessageCircle, Flame } from "lucide-react";
import type { Question } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/providers/AuthProvider";

interface QuestionCardProps {
  question: Question;
  onUpvote: (questionId: number) => void;
}

export function QuestionCard({ question, onUpvote }: QuestionCardProps) {
  const { user } = useAuth();
  const hasVoted = question.my_vote;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group bg-white dark:bg-stone-900 opacity-100 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300"
    >
      {/* Category Badge */}
      <div className="px-5 pt-4">
        <Badge variant="secondary" className="text-xs font-medium bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300 border-0">
          {question.categories?.name || 'General'}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-5 pt-3">
        <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-2 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          {question.title}
        </h3>
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-4 line-clamp-2 leading-relaxed">
          {question.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" />
              {question.vote_count} {question.vote_count === 1 ? 'vote' : 'votes'}
            </div>
          </div>

          <Button
            size="sm"
            variant={hasVoted ? "default" : "outline"}
            onClick={() => onUpvote(question.id)}
            disabled={!user}
            className={`group/btn h-8 px-3 rounded-full gap-1.5 transition-all ${
              hasVoted
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40'
                : 'border-stone-200 dark:border-stone-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30'
            }`}
          >
            {hasVoted ? (
              <Flame className="w-4 h-4" />
            ) : (
              <ArrowBigUp className="w-4 h-4 group-hover/btn:-translate-y-px transition-transform" />
            )}
            <span className="font-semibold text-xs">
              {hasVoted ? 'Voted' : 'Vote'}
            </span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
