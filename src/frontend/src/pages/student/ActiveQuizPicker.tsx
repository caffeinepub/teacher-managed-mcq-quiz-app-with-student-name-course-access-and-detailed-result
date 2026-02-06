import { usePublishedQuizzes } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ActiveQuizPickerProps {
  studentName: string;
  studentCourse: string;
  onSelectQuiz: (quizId: string) => void;
}

export default function ActiveQuizPicker({ studentName, studentCourse, onSelectQuiz }: ActiveQuizPickerProps) {
  const { data: quizzes, isLoading, error } = usePublishedQuizzes();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading available quizzes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load quizzes. Please try again.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Available Quizzes</h1>
        <p className="text-muted-foreground">
          Welcome, <span className="font-medium text-foreground">{studentName}</span> from{' '}
          <span className="font-medium text-foreground">{studentCourse}</span>
        </p>
      </div>

      {!quizzes || quizzes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No quizzes available at the moment</p>
            <p className="text-sm text-muted-foreground mt-2">Please check back later</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{quiz.title}</CardTitle>
                    {quiz.description && (
                      <CardDescription className="mt-2">{quiz.description}</CardDescription>
                    )}
                  </div>
                  <Badge variant="secondary">{quiz.questions.length} questions</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Button onClick={() => onSelectQuiz(quiz.id)} className="w-full">
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
