import { type FC, useState, useRef, useEffect, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PriorityBadge } from './PriorityBadge';
import { TagChip } from './TagChip';
import type { Todo, Priority } from '../types';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<Pick<Todo, 'text' | 'priority' | 'tags'>>) => void;
  index: number;
  isDragEnabled: boolean;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (index: number) => void;
  skipAnimation?: boolean;
}

const PRIORITIES: Priority[] = ['high', 'medium', 'low'];
const MAX_TAGS = 8;
const MAX_TAG_LENGTH = 20;
const DISPLAY_TAGS_LIMIT = 5;

export const TodoItem: FC<TodoItemProps> = memo(({
  todo,
  onToggle,
  onDelete,
  onEdit,
  index,
  isDragEnabled,
  onDragStart,
  onDragOver,
  onDrop,
  skipAnimation = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editPriority, setEditPriority] = useState<Priority>(todo.priority || 'medium');
  const [editTags, setEditTags] = useState<string[]>(todo.tags || []);
  const [tagInput, setTagInput] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const isTruncatedRef = useRef(false);

  // Use ResizeObserver to reliably detect truncation
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const check = () => {
      isTruncatedRef.current = el.scrollHeight > el.clientHeight;
    };
    check();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(check);
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, [todo.text]);

  const showTooltipForText = useCallback(() => {
    if (showTooltip) return; // already showing
    if (!isTruncatedRef.current) return;
    const el = textRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTooltipPos({ top: rect.top, left: rect.left, width: rect.width });
    setShowTooltip(true);
  }, [showTooltip]);

  const handleTextMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!showPriorityDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(e.target as Node)) {
        setShowPriorityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPriorityDropdown]);

  const handlePriorityChange = (p: Priority) => {
    onEdit(todo.id, { priority: p });
    setShowPriorityDropdown(false);
  };

  const startEditing = () => {
    setEditText(todo.text);
    setEditPriority(todo.priority || 'medium');
    setEditTags(todo.tags || []);
    setTagInput('');
    setIsEditing(true);
  };

  const saveEdit = () => {
    // Synchronously compute final tags to avoid stale state from async setEditTags
    let finalTags = editTags;
    const trimmed = tagInput.trim().replace(/,/g, '').slice(0, MAX_TAG_LENGTH);
    if (trimmed && !editTags.includes(trimmed) && editTags.length < MAX_TAGS) {
      finalTags = [...editTags, trimmed];
    }
    setTagInput('');
    setEditTags(finalTags);

    if (editText.trim()) {
      onEdit(todo.id, {
        text: editText.trim(),
        priority: editPriority,
        tags: finalTags.length > 0 ? finalTags : undefined,
      });
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const commitTagInput = () => {
    const trimmed = tagInput.trim().replace(/,/g, '').slice(0, MAX_TAG_LENGTH);
    if (trimmed && !editTags.includes(trimmed) && editTags.length < MAX_TAGS) {
      setEditTags((prev) => [...prev, trimmed]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitTagInput();
    }
  };

  const removeEditTag = (tag: string) => {
    setEditTags((prev) => prev.filter((t) => t !== tag));
  };

  const priority = todo.priority || 'medium';

  return (
    <motion.li
      className={`todo-item ${isEditing ? 'editing' : ''} ${showPriorityDropdown ? 'dropdown-open' : ''}`}
      layout={!skipAnimation}
      layoutId={skipAnimation ? undefined : todo.id}
      initial={skipAnimation ? false : { opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={skipAnimation ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
      transition={skipAnimation ? { duration: 0 } : {
        layout: {
          type: 'spring',
          stiffness: 500,
          damping: 35,
          mass: 0.8,
        },
        opacity: { duration: 0.2, ease: 'easeInOut' },
        scale: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
      }}
      draggable={isDragEnabled && !isEditing}
      onDragStart={() => onDragStart(index)}
      onDragOver={(e: React.DragEvent) => onDragOver(e, index)}
      onDrop={() => onDrop(index)}
    >
      {isEditing ? (
        <div className="edit-mode">
          <input
            ref={editInputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleEditKeyDown}
            className="edit-input"
            aria-label="Edit todo text"
          />
          <div className="edit-options">
            <div className="priority-selector priority-selector-sm">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`priority-btn priority-btn-${p} ${editPriority === p ? 'active' : ''}`}
                  onClick={() => setEditPriority(p)}
                  aria-label={`Set priority to ${p}`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
            <div className="edit-tags-area">
              <input
                type="text"
                className="tag-input tag-input-sm"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={commitTagInput}
                placeholder={editTags.length >= MAX_TAGS ? `Max ${MAX_TAGS} tags` : 'Add tags...'}
                disabled={editTags.length >= MAX_TAGS}
                aria-label="Edit tags"
              />
              {editTags.length > 0 && (
                <div className="tag-chips-row">
                  {editTags.map((tag) => (
                    <TagChip key={tag} tag={tag} onRemove={removeEditTag} />
                  ))}
                  <span className="tag-limit-hint">{editTags.length}/{MAX_TAGS}</span>
                </div>
              )}
            </div>
          </div>
          <div className="edit-actions">
            <button className="edit-save-btn" type="button" onClick={saveEdit} aria-label="Save edit">
              Save
            </button>
            <button className="edit-cancel-btn" type="button" onClick={cancelEdit} aria-label="Cancel edit">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="todo-item-main">
            {isDragEnabled && (
              <span className="drag-handle" aria-label="Drag to reorder">
                <span className="drag-dots" />
              </span>
            )}
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => onToggle(todo.id)}
              aria-label={`Mark ${todo.text} as ${todo.completed ? 'incomplete' : 'complete'}`}
            />
            <div className="priority-dropdown-wrapper" ref={priorityDropdownRef}>
              <PriorityBadge
                priority={priority}
                onClick={() => setShowPriorityDropdown((prev) => !prev)}
                interactive
              />
              <AnimatePresence>
                {showPriorityDropdown && (
                  <motion.div
                    className="priority-dropdown"
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    {PRIORITIES.map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`priority-dropdown-item priority-dropdown-item-${p} ${priority === p ? 'active' : ''}`}
                        onClick={() => handlePriorityChange(p)}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="todo-text-wrapper">
              <span
                ref={textRef}
                className={`todo-text ${todo.completed ? 'completed' : ''}`}
                onDoubleClick={startEditing}
                onMouseEnter={showTooltipForText}
                onMouseMove={showTooltipForText}
                onMouseLeave={handleTextMouseLeave}
              >
                {todo.text}
              </span>
            </div>
            {createPortal(
              <AnimatePresence>
                {showTooltip && tooltipPos && (
                  <motion.div
                    className="todo-text-tooltip"
                    style={{
                      top: tooltipPos.top - 8,
                      left: tooltipPos.left,
                      maxWidth: Math.max(tooltipPos.width, 320),
                    }}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                  >
                    {todo.text}
                  </motion.div>
                )}
              </AnimatePresence>,
              document.body
            )}
            <div className="todo-item-actions">
              <button
                type="button"
                className="edit-btn"
                onClick={startEditing}
                aria-label={`Edit ${todo.text}`}
              >
                Edit
              </button>
              <button type="button" onClick={() => onDelete(todo.id)} aria-label={`Delete ${todo.text}`}>
                Delete
              </button>
            </div>
          </div>
          {todo.tags && todo.tags.length > 0 && (
            <div className="todo-tags">
              {todo.tags.slice(0, DISPLAY_TAGS_LIMIT).map((tag) => (
                <TagChip key={tag} tag={tag} />
              ))}
              {todo.tags.length > DISPLAY_TAGS_LIMIT && (
                <span
                  className="tag-overflow-badge"
                  title={todo.tags.slice(DISPLAY_TAGS_LIMIT).join(', ')}
                >
                  +{todo.tags.length - DISPLAY_TAGS_LIMIT}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </motion.li>
  );
});

TodoItem.displayName = 'TodoItem';
