import { useState, useEffect } from 'react';
import { useQuiz, useCreateQuiz, useUpdateQuiz } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { Question } from '../../backend';
import { toast } from 'sonner';

interface QuizEditorProps {
  quizId?: string;
  onBack: () => void;
}

export default function QuizEditor({ quizId, onBack }: QuizEditorProps) {
  const { data: existingQuiz, isLoading: quizLoading } = useQuiz(quizId);
  const createMutation = useCreateQuiz();
  const updateMutation = useUpdateQuiz();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (existingQuiz) {
      setTitle(existingQuiz.title);
      setDescription(existingQuiz.description || '');
      setQuestions(existingQuiz.questions);
    }
  }, [existingQuiz]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      text: '',
      options: ['', '', '', ''],
      correctAnswerIndex: BigInt(0),
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    const options = [...updated[questionIndex].options];
    options[optionIndex] = value;
    updated[questionIndex] = { ...updated[questionIndex], options };
    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    const options = [...updated[questionIndex].options, ''];
    updated[questionIndex] = { ...updated[questionIndex], options };
    setQuestions(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    const options = updated[questionIndex].options.filter((_, i) => i !== optionIndex);
    updated[questionIndex] = { ...updated[questionIndex], options };
    setQuestions(updated);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Quiz title is required');
      return;
    }

    if (questions.length === 0) {
      toast.error('Add at least one question');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        toast.error(`Question ${i + 1} text is required`);
        return;
      }
      if (q.options.length < 2) {
        toast.error(`Question ${i + 1} needs at least 2 options`);
        return;
      }
      const filledOptions = q.options.filter((opt) => opt.trim());
      if (filledOptions.length < 2) {
        toast.error(`Question ${i + 1} needs at least 2 filled options`);
        return;
      }
    }

    try {
      if (quizId) {
        await updateMutation.mutateAsync({
          quizId,
          title: title.trim(),
          description: description.trim() || null,
          questions,
        });
      } else {
        await createMutation.mutateAsync({
          title: title.trim(),
          description: description.trim() || null,
          questions,
        });
      }
      onBack();
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  if (quizLoading && quizId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Quiz
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{quizId ? 'Edit Quiz' : 'Create New Quiz'}</CardTitle>
          <CardDescription>Fill in the quiz details and add questions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title *</Label>
            <Input
              id="title"
              placeholder="Enter quiz title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter quiz description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Questions</h2>
          <Button onClick={addQuestion} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        {questions.map((question, qIndex) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">Question {qIndex + 1}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => removeQuestion(qIndex)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Question Text *</Label>
                <Input
                  placeholder="Enter question"
                  value={question.text}
                  onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Options (minimum 2) *</Label>
                  <Button variant="ghost" size="sm" onClick={() => addOption(qIndex)}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Option
                  </Button>
                </div>

                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={Number(question.correctAnswerIndex) === oIndex}
                      onChange={() => updateQuestion(qIndex, 'correctAnswerIndex', BigInt(oIndex))}
                      className="flex-shrink-0"
                    />
                    <Input
                      placeholder={`Option ${oIndex + 1}`}
                      value={option}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                      className="flex-1"
                    />
                    {question.options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(qIndex, oIndex)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Select the radio button next to the correct answer
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        {questions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No questions added yet</p>
              <p className="text-sm text-muted-foreground mt-2">Click "Add Question" to create your first question</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
