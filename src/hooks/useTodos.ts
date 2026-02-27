import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { Todo, Priority, FilterType } from "../types";
import { saveTodos, loadTodos } from "../utils/localStorage";

interface PendingDelete {
  todo: Todo;
  index: number;
  timeoutId: ReturnType<typeof setTimeout>;
}

interface UseTodosReturn {
  todos: Todo[];
  filteredTodos: Todo[];
  filter: FilterType;
  searchQuery: string;
  priorityFilter: Set<Priority>;
  setFilter: (filter: FilterType) => void;
  setSearchQuery: (query: string) => void;
  togglePriorityFilter: (priority: Priority) => void;
  addTodo: (text: string, priority?: Priority, tags?: string[]) => boolean;
  editTodo: (
    id: string,
    updates: Partial<Pick<Todo, "text" | "priority" | "tags">>
  ) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  reorderTodos: (fromIndex: number, toIndex: number) => void;
  completeAll: () => void;
  clearCompleted: () => void;
  completedCount: number;
  totalCount: number;
  pendingDelete: { text: string } | null;
  undoDelete: () => void;
  confirmDelete: () => void;
}

export function useTodos(): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      return loadTodos();
    } catch (error) {
      console.error("Failed to load todos from localStorage:", error);
      return [];
    }
  });
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Set<Priority>>(
    new Set()
  );
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    try {
      saveTodos(todos);
    } catch (error) {
      console.error("Failed to save todos to localStorage:", error);
    }
  }, [todos]);

  const filteredTodos = useMemo(() => {
    let result = todos;

    if (filter === "active") {
      result = result.filter((t) => !t.completed);
    } else if (filter === "completed") {
      result = result.filter((t) => t.completed);
    }

    if (priorityFilter.size > 0) {
      result = result.filter((t) => {
        const p = t.priority ?? "medium";
        return priorityFilter.has(p);
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.text.toLowerCase().includes(query) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return result;
  }, [todos, filter, searchQuery, priorityFilter]);

  const todosRef = useRef(todos);
  useEffect(() => {
    todosRef.current = todos;
  }, [todos]);

  const addTodo = useCallback(
    (text: string, priority?: Priority, tags?: string[]): boolean => {
      const normalizedText = text.toLowerCase().trim();
      const isDuplicate = todosRef.current.some(
        (todo) => todo.text.toLowerCase().trim() === normalizedText
      );
      if (isDuplicate) {
        return false;
      }
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        text,
        completed: false,
        ...(priority && { priority }),
        ...(tags && tags.length > 0 && { tags }),
      };
      setTodos((prev) => [newTodo, ...prev]);
      return true;
    },
    []
  );

  const editTodo = useCallback(
    (
      id: string,
      updates: Partial<Pick<Todo, "text" | "priority" | "tags">>
    ) => {
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo))
      );
    },
    []
  );

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const pendingDeleteRef = useRef<PendingDelete | null>(null);
  const [pendingDeleteState, setPendingDeleteState] = useState<{
    text: string;
  } | null>(null);

  const confirmDelete = useCallback(() => {
    if (pendingDeleteRef.current) {
      clearTimeout(pendingDeleteRef.current.timeoutId);
      pendingDeleteRef.current = null;
      setPendingDeleteState(null);
    }
  }, []);

  const undoDelete = useCallback(() => {
    const pending = pendingDeleteRef.current;
    if (pending) {
      clearTimeout(pending.timeoutId);
      const { todo, index } = pending;
      setTodos((prev) => {
        const updated = [...prev];
        const insertAt = Math.min(index, updated.length);
        updated.splice(insertAt, 0, todo);
        return updated;
      });
      pendingDeleteRef.current = null;
      setPendingDeleteState(null);
    }
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => {
      const index = prev.findIndex((todo) => todo.id === id);
      if (index === -1) return prev;
      const todo = prev[index];

      // If there's an existing pending delete, finalize it immediately
      if (pendingDeleteRef.current) {
        clearTimeout(pendingDeleteRef.current.timeoutId);
      }

      const timeoutId = setTimeout(() => {
        pendingDeleteRef.current = null;
        setPendingDeleteState(null);
      }, 5000);

      pendingDeleteRef.current = { todo, index, timeoutId };
      setPendingDeleteState({ text: todo.text });

      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const reorderTodos = useCallback((fromIndex: number, toIndex: number) => {
    setTodos((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  }, []);

  const completeAll = useCallback(() => {
    setTodos((prev) => {
      const allCompleted =
        prev.length > 0 && prev.every((todo) => todo.completed);
      return prev.map((todo) => ({ ...todo, completed: !allCompleted }));
    });
  }, []);

  const togglePriorityFilter = useCallback((priority: Priority) => {
    setPriorityFilter((prev) => {
      const next = new Set(prev);
      if (next.has(priority)) {
        next.delete(priority);
      } else {
        next.add(priority);
      }
      return next;
    });
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  }, []);

  const completedCount = useMemo(
    () => todos.filter((todo) => todo.completed).length,
    [todos]
  );
  const totalCount = todos.length;

  return {
    todos,
    filteredTodos,
    filter,
    searchQuery,
    priorityFilter,
    setFilter,
    setSearchQuery,
    togglePriorityFilter,
    addTodo,
    editTodo,
    toggleTodo,
    deleteTodo,
    reorderTodos,
    completeAll,
    clearCompleted,
    completedCount,
    totalCount,
    pendingDelete: pendingDeleteState,
    undoDelete,
    confirmDelete,
  };
}
