export interface Subscription {
  status: "free" | "premium";
  plan: null | "monthly" | "yearly";
  expiryDate: string | null;
}

export interface Progress {
  streakDays: number;
  hoursStudied: number;
  completedLessons: string[];
  quizzesPassed: number;
  points: number;
}

export interface Teacher {
  id: string;
  name: string;
  origin: string;
  specialty: string;
  bio: string;
  rating: number;
  reviewsCount: number;
  hourlyRate: number;
  avatar: string;
  languages: string[];
  availableSlots: string[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "interactive" | "quiz";
}

export interface Course {
  id: string;
  category: "arabe" | "islam" | "hadith" | "fiqh" | "dogme";
  title: string;
  description: string;
  level: string;
  duration: string;
  lessons: Lesson[];
}

export interface Booking {
  id: string;
  teacherId: string;
  teacherName: string;
  date: string;
  status: string;
  link: string;
}

export interface Question {
  id: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  content: string;
  answer: string | null;
  date: string;
}

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  time: string;
  avatar: string;
}

export interface ForumPost {
  id: string;
  user: string;
  content: string;
  date: string;
}

export interface ForumProject {
  id: string;
  title: string;
  description: string;
  author: string;
  membersCount: number;
  category: string;
  createdAt: string;
  posts: ForumPost[];
}

export interface Resource {
  id: string;
  title: string;
  desc: string;
  size: string;
  downloads: number;
  filename: string;
  category: string;
}

export interface Notification {
  id: string;
  text: string;
  time: string;
  read: boolean;
}

export interface AppState {
  subscription: Subscription;
  progress: Progress;
  teachers: Teacher[];
  courses: Course[];
  bookings: Booking[];
  questions: Question[];
  chatMessages: ChatMessage[];
  forumProjects: ForumProject[];
  resources: Resource[];
  notifications: Notification[];
}
