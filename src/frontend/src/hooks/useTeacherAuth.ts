// This file is deprecated and no longer used.
// Teacher authentication is now handled by useTeacherPasswordAuth.ts
// Keeping this file to avoid breaking imports during migration.

export function useTeacherAuth() {
  return {
    isTeacher: false,
    isLoading: false,
    needsRegistration: false,
    registerAsTeacher: () => {},
    registering: false,
  };
}
