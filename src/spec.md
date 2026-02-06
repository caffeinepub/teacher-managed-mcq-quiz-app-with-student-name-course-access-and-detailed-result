# Specification

## Summary
**Goal:** Build a teacher-managed MCQ quiz app where teachers authenticate via Internet Identity to create/publish quizzes and review detailed student results, while students can take an active quiz by entering name and course (no Internet Identity) and see their results.

**Planned changes:**
- Add teacher authentication via Internet Identity, with backend enforcement for all teacher/admin actions and UI sign-in/out state.
- Implement backend data models and teacher CRUD APIs for quizzes (title, optional description) and MCQ questions (4+ options, exactly one correct answer), with persistence.
- Build teacher UI to list/create/edit quizzes, manage questions (add/edit/delete, set correct option), and activate/publish quizzes.
- Create student start flow to collect Name and Course with validation, then allow taking an active quiz without Internet Identity.
- Enforce “attempt only once per quiz” using Name+Course; if already attempted, show the existing result instead of starting a new attempt.
- Build student quiz-taking UI (select one option per question, submit) and backend scoring/storage of answers and per-question correctness.
- Add teacher results dashboard to view attempts per quiz (Name, Course) and a per-question breakdown of selected answers and correctness (teacher-only access).
- Apply a consistent Tailwind-based visual theme across teacher/student areas with a non-blue/non-purple primary palette.
- Add and use generated static theme assets (logo and subtle background/hero) from `frontend/public/assets/generated`.

**User-visible outcome:** Teachers can sign in to create and publish MCQ quizzes and view detailed results for every student attempt, while students can enter their name/course to take an active quiz once and see a detailed score breakdown after submitting.
