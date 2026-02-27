export type Priority = 'high' | 'medium' | 'low';

export type Theme = 'light' | 'dark';

export type FilterType = 'all' | 'active' | 'completed';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority?: Priority;
  tags?: string[];
}
