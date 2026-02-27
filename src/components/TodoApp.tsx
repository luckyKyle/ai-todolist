import { type FC, useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TodoInput } from "./TodoInput";
import { TodoList } from "./TodoList";
import { TodoToolbar } from "./TodoToolbar";
import { Pagination } from "./Pagination";
import { UndoToast } from "./UndoToast";
import { useTodos } from "../hooks/useTodos";
import { useTheme } from "../hooks/useTheme";

const PAGE_SIZE = 10;

export const TodoApp: FC = () => {
  const {
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
    pendingDelete,
    undoDelete,
    confirmDelete,
  } = useTodos();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time mount trigger for entrance animations
  useEffect(() => {
    setMounted(true);
  }, []);

  // Track rapid filter changes to skip per-item animations
  const [skipAnimation, setSkipAnimation] = useState(false);
  const skipAnimationTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  // Reset to page 1 when filters change & flag animation skip
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: sync page/animation state with filter change
    setCurrentPage(1);
    setSkipAnimation(true);
    clearTimeout(skipAnimationTimer.current);
    skipAnimationTimer.current = setTimeout(() => setSkipAnimation(false), 50);
    return () => clearTimeout(skipAnimationTimer.current);
  }, [filter, searchQuery, priorityFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTodos.length / PAGE_SIZE));

  // Clamp page if items were deleted
  useEffect(() => {
    if (currentPage > totalPages) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clamp to valid range
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedTodos = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredTodos.slice(start, start + PAGE_SIZE);
  }, [filteredTodos, currentPage]);

  const pageOffset = (currentPage - 1) * PAGE_SIZE;

  const isDragEnabled =
    filter === "all" && !searchQuery.trim() && priorityFilter.size === 0;

  return (
    <div className="todo-app">
      <motion.div
        className="header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -20 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="header-content">
          <div>
            <h1 className="title">Taskflow</h1>
            <p className="subtitle">Less clutter, more clarity</p>
          </div>
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Toggle theme"
          >
            <span
              className={`theme-icon ${
                theme === "light" ? "theme-icon-moon" : "theme-icon-sun"
              }`}
            />
          </button>
        </div>
      </motion.div>

      <motion.div
        className="input-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
      >
        <TodoInput onAdd={addTodo} />
      </motion.div>

      {totalCount > 0 && (
        <motion.div
          className="toolbar-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 10 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
        >
          <TodoToolbar
            filter={filter}
            searchQuery={searchQuery}
            priorityFilter={priorityFilter}
            onFilterChange={setFilter}
            onSearchChange={setSearchQuery}
            onPriorityFilterToggle={togglePriorityFilter}
            onCompleteAll={completeAll}
            onClearCompleted={clearCompleted}
            totalCount={totalCount}
            completedCount={completedCount}
          />
        </motion.div>
      )}

      <motion.div
        className="list-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: mounted ? 1 : 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        <TodoList
          todos={paginatedTodos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onEdit={editTodo}
          onReorder={reorderTodos}
          isDragEnabled={isDragEnabled}
          indexOffset={pageOffset}
          skipAnimation={skipAnimation}
        />
      </motion.div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {totalCount > 0 && (
        <motion.div
          className="stats"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
        >
          <p className="stats-text">
            <span>
              {completedCount} of {totalCount} tasks completed
            </span>
            <span>
              {totalCount > 0
                ? Math.round((completedCount / totalCount) * 100)
                : 0}
              %
            </span>
          </p>
          <div className="stats-progress-track">
            <div
              className="stats-progress-bar"
              style={{
                width:
                  totalCount > 0
                    ? `${(completedCount / totalCount) * 100}%`
                    : "0%",
              }}
            />
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {pendingDelete && (
          <UndoToast
            key="undo-toast"
            todoText={pendingDelete.text}
            onUndo={undoDelete}
            onDismiss={confirmDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
