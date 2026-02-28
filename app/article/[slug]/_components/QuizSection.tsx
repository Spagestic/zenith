// app/article/[slug]/_components/QuizSection.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useSessionId } from "@/hooks/useSessionId";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Brain, Trophy, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";

interface QuizSectionProps {
  articleId: Id<"articles">;
}

export function QuizSection({ articleId }: QuizSectionProps) {
  const sessionId = useSessionId();
  const quizzes = useQuery(api.quizzes.getByArticle, { articleId });
  const attempts = useQuery(
    api.quizzes.getAttemptsBySession,
    sessionId ? { articleId, sessionId } : "skip",
  );
  const submitAnswer = useMutation(api.quizzes.submitAnswer);

  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [result, setResult] = useState<{
    isCorrect: boolean;
    correctIndex: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!quizzes || quizzes.length === 0) {
    return null;
  }

  // Check if already completed all quizzes
  const completedQuizIds = new Set(attempts?.map((a) => a.quizId) ?? []);
  const remainingQuizzes = quizzes.filter((q) => !completedQuizIds.has(q._id));

  if (remainingQuizzes.length === 0 && attempts && attempts.length > 0) {
    const correctCount = attempts.filter((a) => a.isCorrect).length;
    return (
      <Card className="bg-linear-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200">
        <CardContent className="pt-6 text-center">
          <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-emerald-800 mb-2">
            Quiz Complete! 🎉
          </h3>
          <p className="text-emerald-700">
            You got <span className="font-bold">{correctCount}</span> out of{" "}
            <span className="font-bold">{attempts.length}</span> correct!
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentQuiz = remainingQuizzes[currentQuizIndex];
  if (!currentQuiz) return null;

  const handleSelect = (index: number) => {
    if (result) return; // Already answered
    setSelectedOption(index);
  };

  const handleSubmit = async () => {
    if (selectedOption === null || !sessionId) return;

    setIsSubmitting(true);
    try {
      const res = await submitAnswer({
        quizId: currentQuiz._id,
        articleId,
        sessionId,
        selectedIndex: selectedOption,
      });
      setResult(res);

      if (res.isCorrect) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setCurrentQuizIndex((prev) => prev + 1);
    setSelectedOption(null);
    setResult(null);
  };

  return (
    <Card className="bg-linear-to-br from-violet-50 to-purple-50 border-2 border-violet-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-violet-800">
          <Brain className="h-5 w-5" />
          Quiz Time!
          <span className="ml-auto text-sm font-normal text-violet-600">
            {currentQuizIndex + 1} of {remainingQuizzes.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-medium text-gray-800">
          {currentQuiz.question}
        </p>

        <div className="space-y-2">
          {currentQuiz.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrectAnswer = result?.correctIndex === index;
            const isWrongSelection = result && isSelected && !result.isCorrect;

            let buttonStyle =
              "border-2 border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50";

            if (result) {
              if (isCorrectAnswer) {
                buttonStyle =
                  "border-2 border-emerald-500 bg-emerald-50 text-emerald-800";
              } else if (isWrongSelection) {
                buttonStyle = "border-2 border-red-500 bg-red-50 text-red-800";
              } else {
                buttonStyle = "border-2 border-gray-200 bg-gray-50 opacity-60";
              }
            } else if (isSelected) {
              buttonStyle = "border-2 border-violet-500 bg-violet-100";
            }

            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={!!result}
                className={`w-full p-4 rounded-xl text-left transition-all ${buttonStyle} flex items-center gap-3`}
              >
                <span className="shrink-0 w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-semibold text-sm">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
                {result && isCorrectAnswer && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                )}
                {isWrongSelection && (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </button>
            );
          })}
        </div>

        {!result ? (
          <Button
            onClick={handleSubmit}
            disabled={selectedOption === null || isSubmitting}
            className="w-full bg-violet-600 hover:bg-violet-700"
            size="lg"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Check Answer"
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <div
              className={`p-4 rounded-xl text-center font-medium ${
                result.isCorrect
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {result.isCorrect
                ? "🎉 Correct! Great job!"
                : "Not quite — but now you know!"}
            </div>
            {currentQuizIndex < remainingQuizzes.length - 1 && (
              <Button
                onClick={handleNext}
                className="w-full"
                variant="outline"
                size="lg"
              >
                Next Question →
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
