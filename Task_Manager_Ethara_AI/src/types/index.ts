// ─────────────────────────────────────────────
// Core Type Definitions for Team Task Manager
// ─────────────────────────────────────────────

export type UserRole = 'admin' | 'member';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type ProjectStatus = 'active' | 'archived';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  createdBy: User;
  members: User[];
  status: ProjectStatus;
  taskCount?: number;
  completedTasks?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  projectId: { _id: string; title: string } | string;
  assignedTo: User | null;
  createdBy: User;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string | null;
  isOverdue?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
