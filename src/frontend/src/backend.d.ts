import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface StudentAttempt {
    studentId: StudentId;
    studentName: string;
    answers: Array<Answer>;
    score: bigint;
    timestamp: bigint;
    course: string;
    quizId: string;
}
export interface AdminActionResult {
    message: string;
    success: boolean;
}
export interface Quiz {
    id: string;
    title: string;
    published: boolean;
    description?: string;
    author: Principal;
    questions: Array<Question>;
}
export type Principal = Principal;
export interface Question {
    id: string;
    text: string;
    correctAnswerIndex: bigint;
    options: Array<string>;
}
export interface ChangePasswordResponse {
    message: string;
    success: boolean;
}
export type StudentId = string;
export interface Answer {
    isCorrect: boolean;
    correctAnswerIndex: bigint;
    selectedOptionIndex: bigint;
    questionId: string;
}
export interface Student {
    id: StudentId;
    name: string;
    course: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    changePassword(arg0: string, oldPassword: string, newPassword: string): Promise<ChangePasswordResponse>;
    createQuiz(password: string, title: string, description: string | null, questions: Array<Question>): Promise<string | null>;
    getAllAttempts(password: string): Promise<Array<StudentAttempt>>;
    getAllQuizzes(password: string): Promise<Array<Quiz>>;
    getAttemptsByStudent(password: string, _quizId: string): Promise<Array<[string, Array<Answer>]>>;
    getAttemptsForStudent(password: string, name: string, course: string): Promise<Array<StudentAttempt>>;
    getCallerUserRole(): Promise<UserRole>;
    getPublishedQuizzes(): Promise<Array<Quiz>>;
    getQuiz(quizId: string): Promise<Quiz>;
    getQuizResultsStats(password: string, quizId: string): Promise<{
        attempts: Array<StudentAttempt>;
        attemptsByQuestion: Array<[Array<Answer>, string]>;
    }>;
    getStudentAttemptsByQuizId(password: string, _quizId: string): Promise<Array<StudentAttempt>>;
    getTeacherQuizzes(password: string): Promise<Array<Quiz>>;
    hasAttemptedQuiz(studentId: string, quizId: string): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    loginStudent(name: string, course: string): Promise<Student>;
    publishQuiz(password: string, quizId: string): Promise<AdminActionResult>;
    submitQuizAttempt(studentName: string, course: string, quizId: string, answers: Array<[string, bigint]>): Promise<{
        attempt: StudentAttempt;
        answers: Array<Answer>;
        isRetake: boolean;
        score: bigint;
    }>;
    updateQuiz(password: string, quizId: string, title: string, description: string | null, questions: Array<Question>): Promise<AdminActionResult>;
    verifyAdminPassword(password: string): Promise<boolean>;
}
