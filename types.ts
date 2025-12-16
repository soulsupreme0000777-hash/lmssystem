export enum Role {
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  email: string;
  role: Role;
  avatar: string;
  bio?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  age?: number;
  name: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  type: 'video' | 'text' | 'quiz' | 'pdf';
  videoUrl?: string; 
  pdfUrl?: string;
  durationMinutes: number;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  thumbnailUrl: string;
  category: string;
  modules: Module[];
  published: boolean;
  totalDuration: number;
  studentsEnrolled: number;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  progress: number;
  completedLessonIds: string[];
  enrolledAt: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  totalPoints: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'graded';
  submittedAt: string;
}

export type Screen = 'dashboard' | 'catalog' | 'course-builder' | 'course-manager' | 'course-viewer' | 'analytics' | 'profile' | 'students';
