import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface AppLayoutProps {
  children: ReactNode;
  isTeacherMode: boolean;
  onSwitchToTeacher: () => void;
  onSwitchToStudent: () => void;
}

export default function AppLayout({
  children,
  isTeacherMode,
  onSwitchToTeacher,
  onSwitchToStudent,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-accent/5">
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'url(/assets/generated/quiz-background.dim_1920x1080.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Header
        isTeacherMode={isTeacherMode}
        onSwitchToTeacher={onSwitchToTeacher}
        onSwitchToStudent={onSwitchToStudent}
      />
      <main className="flex-1 relative z-10">
        <div className="container mx-auto px-4 py-8 max-w-6xl">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
