import { type FC, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface UndoToastProps {
  todoText: string;
  onUndo: () => void;
  onDismiss: () => void;
}

const UNDO_DURATION = 5000;

export const UndoToast: FC<UndoToastProps> = ({ todoText, onUndo, onDismiss }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / UNDO_DURATION) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const displayText = todoText.length > 30 ? todoText.slice(0, 30) + '...' : todoText;

  return (
    <motion.div
      className="undo-toast"
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
      }}
    >
      <div className="undo-toast-content">
        <span className="undo-toast-text">
          Deleted &quot;{displayText}&quot;
        </span>
        <div className="undo-toast-actions">
          <button type="button" className="undo-toast-btn undo-btn" onClick={onUndo}>
            Undo
          </button>
          <button type="button" className="undo-toast-btn dismiss-btn" onClick={onDismiss}>
            ✕
          </button>
        </div>
      </div>
      <div className="undo-toast-progress">
        <motion.div
          className="undo-toast-progress-bar"
          initial={{ width: '100%' }}
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
};
