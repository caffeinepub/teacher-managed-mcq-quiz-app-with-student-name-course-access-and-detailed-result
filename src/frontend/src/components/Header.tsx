import { useTeacherPasswordAuth } from '../hooks/useTeacherPasswordAuth';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User, GraduationCap } from 'lucide-react';

interface HeaderProps {
  isTeacherMode: boolean;
  onSwitchToTeacher: () => void;
  onSwitchToStudent: () => void;
}

export default function Header({ isTeacherMode, onSwitchToTeacher, onSwitchToStudent }: HeaderProps) {
  const { isAuthenticated, logout } = useTeacherPasswordAuth();
  const queryClient = useQueryClient();

  const handleTeacherSignOut = () => {
    logout();
    queryClient.clear();
    onSwitchToStudent();
  };

  return (
    <header className="relative z-20 border-b border-border/50 bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/dev-classes-logo.dim_512x512.png"
              alt="DEV Classes"
              className="h-10 w-10 rounded-lg"
            />
            <div>
              <h1 className="text-xl font-bold text-foreground">DEV Classes Quiz</h1>
              <p className="text-xs text-muted-foreground">
                {isTeacherMode ? 'Teacher Portal' : 'Student Portal'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isTeacherMode && (
              <Button variant="ghost" size="sm" onClick={onSwitchToTeacher}>
                <User className="h-4 w-4 mr-2" />
                Teacher Login
              </Button>
            )}

            {isTeacherMode && !isAuthenticated && (
              <Button variant="ghost" size="sm" onClick={onSwitchToStudent}>
                <GraduationCap className="h-4 w-4 mr-2" />
                Student Portal
              </Button>
            )}

            {isTeacherMode && isAuthenticated && (
              <>
                <Button variant="ghost" size="sm" onClick={onSwitchToStudent}>
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Student Portal
                </Button>
                <Button onClick={handleTeacherSignOut} variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
