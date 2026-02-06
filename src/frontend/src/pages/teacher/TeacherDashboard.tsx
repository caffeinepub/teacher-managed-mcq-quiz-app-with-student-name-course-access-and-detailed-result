import { useTeacherQuizzes, usePublishQuiz } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, BarChart3, Loader2, FileText, Eye, Lock } from 'lucide-react';

interface TeacherDashboardProps {
  onCreateQuiz: () => void;
  onEditQuiz: (quizId: string) => void;
  onViewResults: () => void;
  onChangePassword: () => void;
}

export default function TeacherDashboard({ onCreateQuiz, onEditQuiz, onViewResults, onChangePassword }: TeacherDashboardProps) {
  const { data: quizzes, isLoading } = useTeacherQuizzes();
  const publishMutation = usePublishQuiz();

  const handlePublish = async (quizId: string) => {
    await publishMutation.mutateAsync(quizId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Quizzes</h1>
          <p className="text-muted-foreground mt-1">Create and manage your quiz collection</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onChangePassword}>
            <Lock className="h-4 w-4 mr-2" />
            Change Password
          </Button>
          <Button variant="outline" onClick={onViewResults}>
            <BarChart3 className="h-4 w-4 mr-2" />
            View Results
          </Button>
          <Button onClick={onCreateQuiz}>
            <Plus className="h-4 w-4 mr-2" />
            Create Quiz
          </Button>
        </div>
      </div>

      {!quizzes || quizzes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <p className="text-muted-foreground">You haven't created any quizzes yet</p>
              <p className="text-sm text-muted-foreground mt-2">Click "Create Quiz" to get started</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-2">{quiz.title}</CardTitle>
                  <Badge variant={quiz.published ? 'default' : 'secondary'}>
                    {quiz.published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                {quiz.description && (
                  <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEditQuiz(quiz.id)} className="flex-1">
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </Button>
                  {!quiz.published && (
                    <Button
                      size="sm"
                      onClick={() => handlePublish(quiz.id)}
                      disabled={publishMutation.isPending || quiz.questions.length === 0}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-2" />
                      Publish
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
