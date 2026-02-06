import { ReactNode, useState } from 'react';
import { useTeacherPasswordAuth } from '../hooks/useTeacherPasswordAuth';
import { useActor } from '../hooks/useActor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, LogIn, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface TeacherGateProps {
  children: ReactNode;
}

export default function TeacherGate({ children }: TeacherGateProps) {
  const { isAuthenticated, login, isInitialized } = useTeacherPasswordAuth();
  const { actor, isFetching: actorFetching } = useActor();
  const [passwordInput, setPasswordInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordInput.trim()) {
      toast.error('Please enter a password');
      return;
    }

    if (!actor) {
      toast.error('System not ready, please try again');
      return;
    }

    setIsVerifying(true);
    try {
      const isValid = await actor.verifyAdminPassword(passwordInput);
      if (isValid) {
        login(passwordInput);
        toast.success('Login successful');
      } else {
        toast.error('Invalid password');
        setPasswordInput('');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error?.message || 'Login failed');
      setPasswordInput('');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isInitialized || actorFetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Teacher Login</CardTitle>
            <CardDescription>Enter your password to access the teacher portal</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter teacher password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  disabled={isVerifying}
                  autoFocus
                />
              </div>
              <Button type="submit" disabled={isVerifying} className="w-full" size="lg">
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
