import { type FC, useState } from 'react';
import type { Priority } from '../types';
import { TagChip } from './TagChip';

interface TodoInputProps {
  onAdd: (text: string, priority?: Priority, tags?: string[]) => boolean;
}

const PRIORITIES: Priority[] = ['high', 'medium', 'low'];
const MAX_TAGS = 8;
const MAX_TAG_LENGTH = 20;

export const TodoInput: FC<TodoInputProps> = ({ onAdd }) => {
  const [value, setValue] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState('');

  const handleSubmit = () => {
    if (value.trim()) {
      const success = onAdd(value.trim(), priority, tags);
      if (success) {
        setValue('');
        setPriority('medium');
        setTags([]);
        setTagInput('');
        setDuplicateWarning('');
      } else {
        setDuplicateWarning(`"${value.trim()}" already exists`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmed = tagInput.trim().replace(/,/g, '').slice(0, MAX_TAG_LENGTH);
    if (trimmed && !tags.includes(trimmed) && tags.length < MAX_TAGS) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  return (
    <div className="todo-input-wrapper">
      {duplicateWarning && (
        <div className="duplicate-warning" role="alert">
          {duplicateWarning}
        </div>
      )}
      <div className="todo-input">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (duplicateWarning) setDuplicateWarning('');
          }}
          onKeyDown={handleKeyDown}
          placeholder="Add a new todo..."
          aria-label="Add a new todo"
        />
        <button type="button" onClick={handleSubmit} aria-label="Add todo">
          Add
        </button>
      </div>
      <div className="todo-input-options">
        <div className="priority-selector">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              className={`priority-btn priority-btn-${p} ${priority === p ? 'active' : ''}`}
              onClick={() => setPriority(p)}
              aria-label={`Set priority to ${p}`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <div className="tag-input-area">
          <input
            type="text"
            className="tag-input"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={addTag}
            placeholder={tags.length >= MAX_TAGS ? `Max ${MAX_TAGS} tags` : 'Add tags...'}
            disabled={tags.length >= MAX_TAGS}
            aria-label="Add tags"
          />
        </div>
      </div>
      {tags.length > 0 && (
        <div className="tag-chips-row">
          {tags.map((tag) => (
            <TagChip key={tag} tag={tag} onRemove={removeTag} />
          ))}
          <span className="tag-limit-hint">{tags.length}/{MAX_TAGS}</span>
        </div>
      )}
    </div>
  );
};
