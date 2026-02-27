import { type FC } from "react";
import type { FilterType, Priority } from "../types";

interface TodoToolbarProps {
  filter: FilterType;
  searchQuery: string;
  priorityFilter: Set<Priority>;
  onFilterChange: (filter: FilterType) => void;
  onSearchChange: (query: string) => void;
  onPriorityFilterToggle: (priority: Priority) => void;
  onCompleteAll: () => void;
  onClearCompleted: () => void;
  totalCount: number;
  completedCount: number;
}

const FILTERS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Done" },
];

const PRIORITIES: { value: Priority; label: string; dot: string }[] = [
  { value: "high", label: "High", dot: "priority-dot-high" },
  { value: "medium", label: "Medium", dot: "priority-dot-medium" },
  { value: "low", label: "Low", dot: "priority-dot-low" },
];

export const TodoToolbar: FC<TodoToolbarProps> = ({
  filter,
  searchQuery,
  priorityFilter,
  onFilterChange,
  onSearchChange,
  onPriorityFilterToggle,
  onCompleteAll,
  onClearCompleted,
  totalCount,
  completedCount,
}) => {
  const allCompleted = totalCount > 0 && completedCount === totalCount;

  return (
    <div className="todo-toolbar">
      <div className="toolbar-top">
        <div className="search-box">
          <span className="search-icon" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search todos..."
            aria-label="Search todos"
            className="search-input"
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
            >
              <span className="search-clear-icon" aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="filter-group">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`filter-btn ${filter === f.value ? "active" : ""}`}
              onClick={() => onFilterChange(f.value)}
              aria-label={`Filter: ${f.label}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="toolbar-bottom">
        <div className="filter-group priority-filter-group">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              className={`filter-btn priority-filter-btn ${
                priorityFilter.has(p.value) ? "active" : ""
              }`}
              onClick={() => onPriorityFilterToggle(p.value)}
              aria-label={`Filter priority: ${p.label}`}
            >
              <span className={`priority-dot ${p.dot}`} />
              {p.label}
            </button>
          ))}
        </div>
        <div className="toolbar-actions">
          <button
            type="button"
            className="action-btn"
            onClick={onCompleteAll}
            disabled={totalCount === 0}
            aria-label={
              allCompleted ? "Uncomplete all todos" : "Complete all todos"
            }
          >
            {allCompleted ? "Uncomplete All" : "Complete All"}
          </button>
          <button
            type="button"
            className="action-btn action-btn-danger"
            onClick={onClearCompleted}
            disabled={completedCount === 0}
            aria-label="Clear completed todos"
          >
            Clear Done
          </button>
        </div>
      </div>
    </div>
  );
};
