import { useQuiz, useHasAttemptedQuiz } from '../../hooks/useQueries';
import { useActor } from '../../hooks/useActor';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, Loader2, ChevronLeft, Trophy } from 'lucide-react';
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

  const { data: attempts, isLoading: attemptsLoading } = useQuery<StudentAttempt[]>({
    queryKey: ['studentAttempts', quizId],
    queryFn: async () => {
      if (!actor) return [];
      const allAttempts = await actor.getStudentAttemptsByQuizId(quizId);
      return allAttempts.filter((a) => a.studentId === studentId);
    },
    enabled: !!actor && !!quizId,
  });

  if (quizLoading || attemptsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!quiz || !attempts || attempts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No results found</p>
        </CardContent>
      </Card>
    );
  }

  const attempt = attempts[0];
  const scorePercentage = Math.round((Number(attempt.score) / quiz.questions.length) * 100);

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
            <div className="text-5xl font-bold text-primary">{scorePercentage}%</div>
            <p className="text-muted-foreground">
              You scored {Number(attempt.score)} out of {quiz.questions.length}
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Question Breakdown</h3>
            {quiz.questions.map((question, index) => {
              const answer = attempt.answers.find((a) => a.questionId === question.id);
              const isCorrect = answer?.isCorrect || false;

              return (
                <Card key={question.id} className={isCorrect ? 'border-green-500/30' : 'border-red-500/30'}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-base font-medium flex-1">
                        {index + 1}. {question.text}
                      </CardTitle>
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Your answer:</p>
                      <p className="font-medium">
                        {answer ? question.options[Number(answer.selectedOptionIndex)] : 'Not answered'}
                      </p>
                    </div>
                    {!isCorrect && (
                      <div>
                        <p className="text-sm text-muted-foreground">Correct answer:</p>
                        <p className="font-medium text-green-700 dark:text-green-400">
                          {question.options[Number(question.correctAnswerIndex)]}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
