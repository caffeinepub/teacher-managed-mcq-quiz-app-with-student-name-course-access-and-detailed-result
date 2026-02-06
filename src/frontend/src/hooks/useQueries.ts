import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useTeacherPasswordAuth } from './useTeacherPasswordAuth';
import { Quiz, Question, StudentAttempt, ChangePasswordResponse } from '../backend';
import { toast } from 'sonner';

// Teacher Quiz Management
export function useTeacherQuizzes() {
  const { actor, isFetching: actorFetching } = useActor();
  const { password } = useTeacherPasswordAuth();

  return useQuery<Quiz[]>({
    queryKey: ['teacherQuizzes'],
    queryFn: async () => {
      if (!actor || !password) return [];
      return actor.getTeacherQuizzes(password);
    },
    enabled: !!actor && !actorFetching && !!password,
  });
}

export function useQuiz(quizId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Quiz | null>({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      if (!actor || !quizId) return null;
      try {
        return await actor.getQuiz(quizId);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!quizId,
  });
}

export function useCreateQuiz() {
  const { actor } = useActor();
  const { password } = useTeacherPasswordAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      questions,
    }: {
      title: string;
      description: string | null;
      questions: Question[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      if (!password) throw new Error('Not authenticated');
      return actor.createQuiz(password, title, description, questions);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherQuizzes'] });
      toast.success('Quiz created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create quiz');
    },
  });
}

export function useUpdateQuiz() {
  const { actor } = useActor();
  const { password } = useTeacherPasswordAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      quizId,
      title,
      description,
      questions,
    }: {
      quizId: string;
      title: string;
      description: string | null;
      questions: Question[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      if (!password) throw new Error('Not authenticated');
      return actor.updateQuiz(password, quizId, title, description, questions);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teacherQuizzes'] });
      queryClient.invalidateQueries({ queryKey: ['quiz', variables.quizId] });
      toast.success('Quiz updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update quiz');
    },
  });
}

export function usePublishQuiz() {
  const { actor } = useActor();
  const { password } = useTeacherPasswordAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: string) => {
      if (!actor) throw new Error('Actor not available');
      if (!password) throw new Error('Not authenticated');
      return actor.publishQuiz(password, quizId);
    },
    onSuccess: (_, quizId) => {
      queryClient.invalidateQueries({ queryKey: ['teacherQuizzes'] });
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
      queryClient.invalidateQueries({ queryKey: ['publishedQuizzes'] });
      toast.success('Quiz published successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to publish quiz');
    },
  });
}

// Student Quiz Access
export function usePublishedQuizzes() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Quiz[]>({
    queryKey: ['publishedQuizzes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublishedQuizzes();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useHasAttemptedQuiz(studentName: string, studentCourse: string, quizId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  const getStudentId = (name: string, course: string) => {
    return name.trim() + '__' + course.trim();
  };

  return useQuery<boolean>({
    queryKey: ['hasAttempted', studentName, studentCourse, quizId],
    queryFn: async () => {
      if (!actor) return false;
      const studentId = getStudentId(studentName, studentCourse);
      return actor.hasAttemptedQuiz(studentId, quizId);
    },
    enabled: !!actor && !actorFetching && !!studentName && !!studentCourse && !!quizId,
  });
}

export function useSubmitQuizAttempt() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentName,
      course,
      quizId,
      answers,
    }: {
      studentName: string;
      course: string;
      quizId: string;
      answers: Array<[string, bigint]>;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitQuizAttempt(studentName, course, quizId, answers);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['hasAttempted', variables.studentName, variables.course, variables.quizId],
      });
      queryClient.invalidateQueries({ queryKey: ['studentAttempts'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to submit quiz');
    },
  });
}

// Teacher Results
export function useQuizAttempts(quizId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();
  const { password } = useTeacherPasswordAuth();

  return useQuery<StudentAttempt[]>({
    queryKey: ['quizAttempts', quizId],
    queryFn: async () => {
      if (!actor || !quizId || !password) return [];
      return actor.getStudentAttemptsByQuizId(password, quizId);
    },
    enabled: !!actor && !actorFetching && !!quizId && !!password,
  });
}

// Change Password
export function useChangePassword() {
  const { actor } = useActor();
  const { password, updatePassword } = useTeacherPasswordAuth();

  return useMutation({
    mutationFn: async ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) => {
      if (!actor) throw new Error('Actor not available');
      if (!password) throw new Error('Not authenticated');
      return actor.changePassword(password, oldPassword, newPassword);
    },
    onSuccess: (response: ChangePasswordResponse, variables) => {
      if (response.success) {
        updatePassword(variables.newPassword);
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to change password');
    },
  });
}
