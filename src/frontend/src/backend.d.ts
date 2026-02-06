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
export interface Answer {
    isCorrect: boolean;
    correctAnswerIndex: bigint;
    selectedOptionIndex: bigint;
    questionId: string;
}
export type StudentId = string;
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
    createQuiz(title: string, description: string | null, questions: Array<Question>): Promise<string>;
    getAllAttempts(): Promise<Array<StudentAttempt>>;
    getAllQuizzes(): Promise<Array<Quiz>>;
    getAttemptsByStudent(_quizId: string): Promise<Array<[string, Array<Answer>]>>;
    getAttemptsForStudent(name: string, course: string): Promise<Array<StudentAttempt>>;
    getCallerUserRole(): Promise<UserRole>;
    getPublishedQuizzes(): Promise<Array<Quiz>>;
    getQuiz(quizId: string): Promise<Quiz>;
    getQuizResultsStats(quizId: string): Promise<{
        attempts: Array<StudentAttempt>;
        attemptsByQuestion: Array<[Array<Answer>, string]>;
    }>;
    getStudentAttemptsByQuizId(_quizId: string): Promise<Array<StudentAttempt>>;
    getTeacherQuizzes(): Promise<Array<Quiz>>;
    hasAttemptedQuiz(studentId: string, quizId: string): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    loginStudent(name: string, course: string): Promise<Student>;
    publishQuiz(quizId: string): Promise<void>;
    registerTeacher(name: string): Promise<void>;
    submitQuizAttempt(studentName: string, course: string, quizId: string, answers: Array<[string, bigint]>): Promise<{
        attempt: StudentAttempt;
        answers: Array<Answer>;
        isRetake: boolean;
        score: bigint;
    }>;
    updateQuiz(quizId: string, title: string, description: string | null, questions: Array<Question>): Promise<void>;
}
