import { type FC, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TodoItem } from './TodoItem';
import type { Todo } from '../types';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<Pick<Todo, 'text' | 'priority' | 'tags'>>) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  isDragEnabled: boolean;
  indexOffset?: number;
  skipAnimation?: boolean;
}

export const TodoList: FC<TodoListProps> = ({
  todos,
  onToggle,
  onDelete,
  onEdit,
  onReorder,
  isDragEnabled,
  indexOffset = 0,
  skipAnimation = false,
}) => {
  const dragItem = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragOver = (e: React.DragEvent, _index: number) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (dragItem.current !== null && dragItem.current !== index) {
      onReorder(dragItem.current + indexOffset, index + indexOffset);
    }
    dragItem.current = null;
  };

  const handleDragEnd = () => {
    dragItem.current = null;
  };

  if (todos.length === 0) {
    return (
      <motion.div
        className="empty-state"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="empty-icon" aria-hidden="true">
          <span className="empty-icon-line" />
          <span className="empty-icon-line short" />
          <span className="empty-icon-line shorter" />
        </div>
        <p className="empty-text">Your slate is clean</p>
        <p className="empty-hint">Start by adding a task above</p>
      </motion.div>
    );
  }

  return (
    <ul className="todo-list" onDragEnd={handleDragEnd}>
      <AnimatePresence initial={false} mode={skipAnimation ? 'popLayout' : 'sync'}>
        {todos.map((todo, index) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
            index={index}
            isDragEnabled={isDragEnabled}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            skipAnimation={skipAnimation}
          />
        ))}
      </AnimatePresence>
    </ul>
  );
};
