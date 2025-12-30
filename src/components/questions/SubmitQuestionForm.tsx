"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Building2,
  Heart,
  GraduationCap,
  TrendingUp,
  Leaf,
  Flame,
  Loader2
} from "lucide-react";

const formSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().min(20, "Description must be at least 20 characters"),
});

type FormData = z.infer<typeof formSchema>;

interface SubmitQuestionFormProps {
  onSubmit: (data: FormData) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

const CATEGORIES = [
  { id: "1", name: "Infrastructure", icon: Building2, gradient: "from-blue-500 to-cyan-500" },
  { id: "2", name: "Healthcare", icon: Heart, gradient: "from-rose-500 to-pink-500" },
  { id: "3", name: "Education", icon: GraduationCap, gradient: "from-purple-500 to-violet-500" },
  { id: "4", name: "Economy", icon: TrendingUp, gradient: "from-amber-500 to-orange-500" },
  { id: "5", name: "Environment", icon: Leaf, gradient: "from-emerald-500 to-teal-500" },
];

export function SubmitQuestionForm({ onSubmit, onClose, isSubmitting = false }: SubmitQuestionFormProps) {
  const [step, setStep] = useState(1);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const selectedCategory = watch("category");
  const title = watch("title");
  const description = watch("description");

  const handleNext = () => {
    if (step === 1 && title?.length >= 10 && selectedCategory) {
      setStep(2);
    }
  };

  const onFormSubmit = (data: FormData) => {
    onSubmit(data);
  };

  return (
    <div className="px-2 py-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
          <Flame className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-stone-900 dark:text-white mb-2">
          Share Your Question
        </h2>
        <p className="text-stone-600 dark:text-stone-400">
          Your voice matters. Let's make it heard.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-10">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          step === 1 
            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
            : 'bg-orange-500 text-white'
        }`}>
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
          <span>Details</span>
        </div>
        <div className="w-8 h-px bg-stone-200 dark:bg-stone-700" />
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          step === 2 
            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
        }`}>
          <div className="w-1.5 h-1.5 rounded-full bg-current" />
          <span>Description</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <Label htmlFor="title" className="flex items-center gap-2 text-stone-900 dark:text-white font-semibold mb-3">
                  <FileText className="w-4 h-4 text-orange-500" />
                  Question Title
                </Label>
                <Input
                  id="title"
                  placeholder="What would you like to ask?"
                  {...register("title")}
                  className="h-12 border-stone-200 dark:border-stone-800 focus:border-orange-500 dark:focus:border-orange-400 rounded-xl"
                />
                {errors.title && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">{errors.title.message}</p>
                )}
                <p className="text-xs text-stone-500 mt-2">
                  {title?.length || 0} / 100 characters
                </p>
              </div>

              <div>
                <Label className="text-stone-900 dark:text-white font-semibold mb-3 block">
                  Choose Category
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    const isSelected = selectedCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setValue("category", category.id)}
                        className={`relative p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 shadow-lg shadow-orange-500/20'
                            : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-2 mx-auto`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-stone-900 dark:text-white block">
                          {category.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.category && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">{errors.category.message}</p>
                )}
              </div>

              <Button
                type="button"
                onClick={handleNext}
                disabled={!title || title.length < 10 || !selectedCategory}
                className="w-full h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30 font-semibold"
              >
                Continue
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <Label htmlFor="description" className="text-stone-900 dark:text-white font-semibold mb-3 block">
                  Detailed Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide context, explain why this matters, and what impact it could have..."
                  {...register("description")}
                  rows={8}
                  className="resize-none border-stone-200 dark:border-stone-800 focus:border-orange-500 dark:focus:border-orange-400 rounded-xl"
                />
                {errors.description && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">{errors.description.message}</p>
                )}
                <p className="text-xs text-stone-500 mt-2">
                  {description?.length || 0} / 500 characters
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 h-12 rounded-full border-2 border-stone-200 dark:border-stone-800"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={!description || description.length < 20 || isSubmitting}
                  className="flex-1 h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30 font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Submit Question
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
