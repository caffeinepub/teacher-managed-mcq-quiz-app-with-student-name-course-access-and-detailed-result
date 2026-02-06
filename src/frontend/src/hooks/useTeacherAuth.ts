import { useState } from 'react';
import { useInternetIdentity } from './useInternetIdentity';
import { useActor } from './useActor';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserRole } from '../backend';
import { toast } from 'sonner';

export function useTeacherAuth() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const roleQuery = useQuery<UserRole>({
    queryKey: ['userRole', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: false,
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const principal = identity?.getPrincipal().toString() || 'Teacher';
      await actor.registerTeacher(principal.slice(0, 8));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRole'] });
      toast.success('Successfully registered as teacher');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to register as teacher';
      toast.error(message);
    },
  });

  const isTeacher =
    roleQuery.data === UserRole.admin || roleQuery.data === UserRole.user;
  const needsRegistration = isAuthenticated && roleQuery.isFetched && roleQuery.data === UserRole.guest;

  return {
    isTeacher,
    isLoading: actorFetching || roleQuery.isLoading,
    needsRegistration,
    registerAsTeacher: registerMutation.mutate,
    registering: registerMutation.isPending,
  };
}
