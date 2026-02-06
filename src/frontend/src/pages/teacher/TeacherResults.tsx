import { useState } from 'react';
import { useTeacherQuizzes, useQuizAttempts, useQuiz } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Loader2, FileText, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { StudentAttempt } from '../../backend';

interface TeacherResultsProps {
  onBack: () => void;
}

export default function TeacherResults({ onBack }: TeacherResultsProps) {
  const { data: quizzes, isLoading: quizzesLoading } = useTeacherQuizzes();
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  const [selectedAttempt, setSelectedAttempt] = useState<StudentAttempt | null>(null);

  const { data: attempts, isLoading: attemptsLoading } = useQuizAttempts(selectedQuizId || undefined);
  const { data: selectedQuiz } = useQuiz(selectedQuizId || undefined);

  if (quizzesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Student Results</h1>
          <p className="text-muted-foreground mt-1">View detailed results for each quiz</p>
        </div>
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Quiz</CardTitle>
          <CardDescription>Choose a quiz to view student attempts</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedQuizId} onValueChange={setSelectedQuizId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a quiz" />
            </SelectTrigger>
            <SelectContent>
              {quizzes?.map((quiz) => (
                <SelectItem key={quiz.id} value={quiz.id}>
                  {quiz.title} ({quiz.questions.length} questions)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedQuizId && (
        <>
          {attemptsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !attempts || attempts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No student attempts yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                Student Attempts ({attempts.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {attempts.map((attempt) => {
                  const scorePercentage = Math.round(
                    (Number(attempt.score) / selectedQuiz!.questions.length) * 100
                  );
                  return (
                    <Card key={`${attempt.studentId}-${attempt.quizId}`}>
                      <CardHeader>
                        <CardTitle className="text-lg">{attempt.studentName}</CardTitle>
                        <CardDescription>{attempt.course}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Score:</span>
                          <Badge variant={scorePercentage >= 70 ? 'default' : 'secondary'}>
                            {Number(attempt.score)} / {selectedQuiz!.questions.length} ({scorePercentage}%)
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setSelectedAttempt(attempt)}
                        >
                          <Eye className="h-3 w-3 mr-2" />
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={!!selectedAttempt} onOpenChange={() => setSelectedAttempt(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Attempt Details</DialogTitle>
            <DialogDescription>
              {selectedAttempt?.studentName} - {selectedAttempt?.course}
            </DialogDescription>
          </DialogHeader>
          {selectedAttempt && selectedQuiz && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                <span className="font-medium">Total Score:</span>
                <Badge>
                  {Number(selectedAttempt.score)} / {selectedQuiz.questions.length}
                </Badge>
              </div>

              <div className="space-y-3">
                {selectedQuiz.questions.map((question, index) => {
                  const answer = selectedAttempt.answers.find((a) => a.questionId === question.id);
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
                          <p className="text-sm text-muted-foreground">Student's answer:</p>
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
