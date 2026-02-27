import { type FC } from 'react';

interface TagChipProps {
  tag: string;
  onRemove?: (tag: string) => void;
}

const TAG_COUNT = 8;

function hashTag(tag: string): number {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash << 5) - hash + tag.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export const TagChip: FC<TagChipProps> = ({ tag, onRemove }) => {
  const colorIndex = hashTag(tag) % TAG_COUNT;

  return (
    <span
      className="tag-chip"
      data-tag-color={colorIndex}
      aria-label={`Tag: ${tag}`}
      title={tag}
    >
      <span className="tag-chip-hash">#</span>
      <span>{tag}</span>
      {onRemove && (
        <button
          type="button"
          className="tag-chip-remove"
          onClick={() => onRemove(tag)}
          aria-label={`Remove tag ${tag}`}
        >
          ×
        </button>
      )}
    </span>
  );
};
