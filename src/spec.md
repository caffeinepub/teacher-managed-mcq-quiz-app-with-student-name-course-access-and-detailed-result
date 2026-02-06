# Specification

## Summary
**Goal:** Replace Internet Identity teacher authentication with a single password-based teacher login (default `admin123`), add change-password capability, and update portal branding to the DEV Classes logo.

**Planned changes:**
- Backend: Remove Internet Identity/role-based gating for teacher/admin methods and instead require a valid teacher password for all teacher-only operations (create/update/publish quizzes, view results, and other teacher-only APIs), while leaving student flows unchanged.
- Backend: Add upgrade-safe storage for the teacher password (defaults to `admin123` on fresh deploy), plus APIs for teacher login (validate password) and change password (old + new password).
- Frontend: Update teacher portal gating and header controls to use password login state (prompt for password, sign in/out) and remove any Internet Identity login/logout UI for teachers, without editing immutable frontend paths.
- Frontend: Replace the existing header logo asset in both Student and Teacher portals with the DEV Classes logo.

**User-visible outcome:** Students use the app as before, while teachers access the dashboard/editor/results only after entering the correct password, can sign out, can change the password from the teacher UI, and see the DEV Classes logo across the app headers.
