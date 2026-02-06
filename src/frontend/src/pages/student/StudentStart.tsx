import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, ArrowRight } from 'lucide-react';

interface StudentStartProps {
  onLogin: (name: string, course: string) => void;
}

export default function StudentStart({ onLogin }: StudentStartProps) {
  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [errors, setErrors] = useState<{ name?: string; course?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; course?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!course.trim()) {
      newErrors.course = 'Course is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onLogin(name.trim(), course.trim());
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl">Welcome, Student!</CardTitle>
            <CardDescription className="text-base mt-2">
              Enter your details to start taking quizzes
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="course">Course Name</Label>
              <Input
                id="course"
                placeholder="Enter your course name"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className={errors.course ? 'border-destructive' : ''}
              />
              {errors.course && <p className="text-sm text-destructive">{errors.course}</p>}
            </div>

            <Button type="submit" className="w-full" size="lg">
              Continue to Quizzes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
