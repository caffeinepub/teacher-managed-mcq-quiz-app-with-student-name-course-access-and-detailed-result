import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User, GraduationCap } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  isTeacherMode: boolean;
  onSwitchToTeacher: () => void;
  onSwitchToStudent: () => void;
}

export default function Header({ isTeacherMode, onSwitchToTeacher, onSwitchToStudent }: HeaderProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      onSwitchToStudent();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="relative z-20 border-b border-border/50 bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/quiz-logo.dim_512x512.png"
              alt="Quiz App"
              className="h-10 w-10 rounded-lg"
            />
            <div>
              <h1 className="text-xl font-bold text-foreground">QuizMaster</h1>
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

            {isTeacherMode && (
              <Button variant="ghost" size="sm" onClick={onSwitchToStudent}>
                <GraduationCap className="h-4 w-4 mr-2" />
                Student Portal
              </Button>
            )}

            {isTeacherMode && (
              <Button
                onClick={handleAuth}
                disabled={isLoggingIn}
                variant={isAuthenticated ? 'outline' : 'default'}
                size="sm"
              >
                {isLoggingIn ? (
                  'Signing in...'
                ) : isAuthenticated ? (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
