import { useState } from 'react';
import { useActor } from './hooks/useActor';
import AppLayout from './components/AppLayout';
import StudentStart from './pages/student/StudentStart';
import ActiveQuizPicker from './pages/student/ActiveQuizPicker';
import QuizTake from './pages/student/QuizTake';
import StudentResult from './pages/student/StudentResult';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import QuizEditor from './pages/teacher/QuizEditor';
import TeacherResults from './pages/teacher/TeacherResults';
import ChangePassword from './pages/teacher/ChangePassword';
import TeacherGate from './components/TeacherGate';
import { Toaster } from '@/components/ui/sonner';

type StudentSession = {
  name: string;
  course: string;
};

type AppView =
  | { type: 'student-start' }
  | { type: 'student-quiz-picker' }
  | { type: 'student-quiz-take'; quizId: string }
  | { type: 'student-result'; quizId: string }
  | { type: 'teacher-dashboard' }
  | { type: 'teacher-quiz-editor'; quizId?: string }
  | { type: 'teacher-results' }
  | { type: 'teacher-change-password' };

export default function App() {
  const { actor } = useActor();
  const [studentSession, setStudentSession] = useState<StudentSession | null>(null);
  const [currentView, setCurrentView] = useState<AppView>({ type: 'student-start' });

  const isTeacherMode = currentView.type.startsWith('teacher-');

  const handleStudentLogin = (name: string, course: string) => {
    setStudentSession({ name, course });
    setCurrentView({ type: 'student-quiz-picker' });
  };

  const handleSelectQuiz = (quizId: string) => {
    setCurrentView({ type: 'student-quiz-take', quizId });
  };

  const handleQuizSubmitted = (quizId: string) => {
    setCurrentView({ type: 'student-result', quizId });
  };

  const handleBackToQuizPicker = () => {
    setCurrentView({ type: 'student-quiz-picker' });
  };

  const handleSwitchToTeacher = () => {
    setCurrentView({ type: 'teacher-dashboard' });
  };

  const handleSwitchToStudent = () => {
    setStudentSession(null);
    setCurrentView({ type: 'student-start' });
  };

  const handleCreateQuiz = () => {
    setCurrentView({ type: 'teacher-quiz-editor' });
  };

  const handleEditQuiz = (quizId: string) => {
    setCurrentView({ type: 'teacher-quiz-editor', quizId });
  };

  const handleBackToDashboard = () => {
    setCurrentView({ type: 'teacher-dashboard' });
  };

  const handleViewResults = () => {
    setCurrentView({ type: 'teacher-results' });
  };

  const handleChangePassword = () => {
    setCurrentView({ type: 'teacher-change-password' });
  };

  const handleShowExistingResult = (quizId: string) => {
    setCurrentView({ type: 'student-result', quizId });
  };

  return (
    <AppLayout
      isTeacherMode={isTeacherMode}
      onSwitchToTeacher={handleSwitchToTeacher}
      onSwitchToStudent={handleSwitchToStudent}
    >
      {currentView.type === 'student-start' && <StudentStart onLogin={handleStudentLogin} />}

      {currentView.type === 'student-quiz-picker' && studentSession && (
        <ActiveQuizPicker
          studentName={studentSession.name}
          studentCourse={studentSession.course}
          onSelectQuiz={handleSelectQuiz}
        />
      )}

      {currentView.type === 'student-quiz-take' && studentSession && (
        <QuizTake
          quizId={currentView.quizId}
          studentName={studentSession.name}
          studentCourse={studentSession.course}
          onSubmitted={handleQuizSubmitted}
          onShowExistingResult={handleShowExistingResult}
          onBack={handleBackToQuizPicker}
        />
      )}

      {currentView.type === 'student-result' && studentSession && (
        <StudentResult
          quizId={currentView.quizId}
          studentName={studentSession.name}
          studentCourse={studentSession.course}
          onBack={handleBackToQuizPicker}
        />
      )}

      {currentView.type === 'teacher-dashboard' && (
        <TeacherGate>
          <TeacherDashboard
            onCreateQuiz={handleCreateQuiz}
            onEditQuiz={handleEditQuiz}
            onViewResults={handleViewResults}
            onChangePassword={handleChangePassword}
          />
        </TeacherGate>
      )}

      {currentView.type === 'teacher-quiz-editor' && (
        <TeacherGate>
          <QuizEditor quizId={currentView.quizId} onBack={handleBackToDashboard} />
        </TeacherGate>
      )}

      {currentView.type === 'teacher-results' && (
        <TeacherGate>
          <TeacherResults onBack={handleBackToDashboard} />
        </TeacherGate>
      )}

      {currentView.type === 'teacher-change-password' && (
        <TeacherGate>
          <ChangePassword onBack={handleBackToDashboard} />
        </TeacherGate>
      )}

      <Toaster />
    </AppLayout>
  );
}
