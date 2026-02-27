import type { Todo, Theme } from '../types';

interface StorageData<T> {
  version: number;
  timestamp: string;
  data: T;
}

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

const STORAGE_KEYS = {
  todos: 'todos',
  legacyTodos: 'todos_v1',
  theme: 'theme',
} as const;

const CURRENT_VERSION = 1;

export function saveTodos(todos: Todo[]): void {
  try {
    const data: StorageData<Todo[]> = {
      version: CURRENT_VERSION,
      timestamp: new Date().toISOString(),
      data: todos,
    };
    localStorage.setItem(STORAGE_KEYS.todos, JSON.stringify(data));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new StorageError('LocalStorage quota exceeded. Unable to save todos.');
    }
    throw new StorageError(`Failed to save todos: ${error}`);
  }
}

function isValidTodo(item: unknown): item is Todo {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof (item as Todo).id === 'string' &&
    typeof (item as Todo).text === 'string' &&
    typeof (item as Todo).completed === 'boolean'
  );
}

export function loadTodos(): Todo[] {
  try {
    const saved =
      localStorage.getItem(STORAGE_KEYS.todos) ??
      localStorage.getItem(STORAGE_KEYS.legacyTodos);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    // Versioned envelope format
    if (parsed.version && parsed.data && Array.isArray(parsed.data)) {
      return parsed.data.filter(isValidTodo);
    }

    // Legacy format: plain Todo[] array
    if (Array.isArray(parsed)) {
      return parsed.filter(isValidTodo);
    }

    return [];
  } catch (error) {
    throw new StorageError(`Failed to load todos: ${error}`);
  }
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new StorageError('LocalStorage quota exceeded. Unable to save theme.');
    }
    throw new StorageError(`Failed to save theme: ${error}`);
  }
}

export function loadTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEYS.theme);
    if (value === 'light' || value === 'dark') {
      return value;
    }
    return null;
  } catch (error) {
    throw new StorageError(`Failed to load theme: ${error}`);
  }
}

export function clearAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.todos);
    localStorage.removeItem(STORAGE_KEYS.legacyTodos);
    localStorage.removeItem(STORAGE_KEYS.theme);
  } catch (error) {
    throw new StorageError(`Failed to clear data: ${error}`);
  }
}
