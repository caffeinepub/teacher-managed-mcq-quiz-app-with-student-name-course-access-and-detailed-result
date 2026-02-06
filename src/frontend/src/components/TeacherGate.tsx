import { ReactNode } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useTeacherAuth } from '../hooks/useTeacherAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, LogIn, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TeacherGateProps {
  children: ReactNode;
}

export default function TeacherGate({ children }: TeacherGateProps) {
  const { login, loginStatus, identity } = useInternetIdentity();
  const { isTeacher, isLoading, needsRegistration, registerAsTeacher, registering } = useTeacherAuth();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  if (isLoading || loginStatus === 'initializing') {
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
            <CardTitle>Teacher Sign In Required</CardTitle>
            <CardDescription>Please sign in with Internet Identity to access the teacher portal</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={login} disabled={isLoggingIn} className="w-full" size="lg">
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In with Internet Identity
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (needsRegistration) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Complete Teacher Registration</CardTitle>
            <CardDescription>You need to register as a teacher to access this area</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your account is authenticated but not registered as a teacher. Click below to complete registration.
              </AlertDescription>
            </Alert>
            <Button onClick={() => registerAsTeacher()} disabled={registering} className="w-full" size="lg">
              {registering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register as Teacher'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isTeacher) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have permission to access the teacher portal</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
