import { useQuiz } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, Loader2, ChevronLeft, Trophy } from 'lucide-react';
import { useActor } from '../../hooks/useActor';
import { useQuery } from '@tanstack/react-query';
import { StudentAttempt } from '../../backend';

interface StudentResultProps {
  quizId: string;
  studentName: string;
  studentCourse: string;
  onBack: () => void;
}

export default function StudentResult({ quizId, studentName, studentCourse, onBack }: StudentResultProps) {
  const { data: quiz, isLoading: quizLoading } = useQuiz(quizId);
  const { actor } = useActor();

  const getStudentId = (name: string, course: string) => {
    return name.trim() + '__' + course.trim();
  };

  const studentId = getStudentId(studentName, studentCourse);

  // Check if student has attempted this quiz
  const { data: hasAttempted, isLoading: checkingAttempt } = useQuery<boolean>({
    queryKey: ['hasAttempted', studentName, studentCourse, quizId],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasAttemptedQuiz(studentId, quizId);
    },
    enabled: !!actor && !!quizId,
  });

  if (quizLoading || checkingAttempt) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!quiz || !hasAttempted) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No results found. Please complete the quiz first.</p>
          <Button onClick={onBack} className="mt-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Quizzes
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Note: Since students cannot fetch their own attempt details from the backend,
  // this page will show a simplified result view. The full breakdown is only
  // available immediately after quiz submission via the returned attempt object.
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" onClick={onBack}>
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Quizzes
      </Button>

      <Card className="border-primary/20">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl">Quiz Completed!</CardTitle>
            <CardDescription className="text-base mt-2">{quiz.title}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-lg text-muted-foreground">
              You have already completed this quiz.
            </p>
            <p className="text-sm text-muted-foreground">
              Your results have been recorded. Contact your teacher for detailed feedback.
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quiz Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Questions:</span>
                <span className="font-medium">{quiz.questions.length}</span>
              </div>
              {quiz.description && (
                <div>
                  <span className="text-muted-foreground">Description:</span>
                  <p className="mt-1">{quiz.description}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
