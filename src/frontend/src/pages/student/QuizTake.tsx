import { useState, useEffect } from 'react';
import { useQuiz, useHasAttemptedQuiz, useSubmitQuizAttempt } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface QuizTakeProps {
  quizId: string;
  studentName: string;
  studentCourse: string;
  onSubmitted: (quizId: string) => void;
  onShowExistingResult: (quizId: string) => void;
  onBack: () => void;
}

export default function QuizTake({
  quizId,
  studentName,
  studentCourse,
  onSubmitted,
  onShowExistingResult,
  onBack,
}: QuizTakeProps) {
  const { data: quiz, isLoading: quizLoading } = useQuiz(quizId);
  const { data: hasAttempted, isLoading: attemptLoading } = useHasAttemptedQuiz(
    studentName,
    studentCourse,
    quizId
  );
  const submitMutation = useSubmitQuizAttempt();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (hasAttempted) {
      toast.info('You have already attempted this quiz');
      onShowExistingResult(quizId);
    }
  }, [hasAttempted, quizId, onShowExistingResult]);

  if (quizLoading || attemptLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Quiz not found</AlertDescription>
      </Alert>
    );
  }

  if (hasAttempted) {
    return null;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const allAnswered = answers.size === quiz.questions.length;

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = new Map(answers);
    newAnswers.set(currentQuestion.id, optionIndex);
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!allAnswered) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    const formattedAnswers: Array<[string, bigint]> = quiz.questions.map((q) => [
      q.id,
      BigInt(answers.get(q.id) || 0),
    ]);

    try {
      await submitMutation.mutateAsync({
        studentName,
        course: studentCourse,
        quizId,
        answers: formattedAnswers,
      });
      toast.success('Quiz submitted successfully!');
      onSubmitted(quizId);
    } catch (error: any) {
      console.error('Submit error:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Quizzes
        </Button>
        <div className="text-sm text-muted-foreground">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{quiz.title}</CardTitle>
          {quiz.description && <CardDescription>{quiz.description}</CardDescription>}
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Question {currentQuestionIndex + 1}: {currentQuestion.text}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={answers.get(currentQuestion.id)?.toString()}
            onValueChange={(value) => handleAnswerSelect(parseInt(value))}
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          {answers.size} / {quiz.questions.length} answered
        </div>

        {!isLastQuestion ? (
          <Button onClick={handleNext}>
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!allAnswered || submitMutation.isPending}>
            {submitMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Quiz
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
