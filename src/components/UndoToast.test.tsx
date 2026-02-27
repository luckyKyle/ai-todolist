import { render, screen, fireEvent, act } from '@testing-library/react';
import { UndoToast } from './UndoToast';

// Mock framer-motion to avoid animation complexity in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('UndoToast', () => {
  const mockOnUndo = jest.fn();
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render the deleted todo text', () => {
    render(<UndoToast todoText="Buy groceries" onUndo={mockOnUndo} onDismiss={mockOnDismiss} />);

    expect(screen.getByText(/Buy groceries/)).toBeInTheDocument();
  });

  it('should show "Deleted" prefix', () => {
    render(<UndoToast todoText="Task" onUndo={mockOnUndo} onDismiss={mockOnDismiss} />);

    expect(screen.getByText(/Deleted/)).toBeInTheDocument();
  });

  it('should truncate long text to 30 characters with ellipsis', () => {
    const longText = 'This is a very long todo item that exceeds thirty characters';
    render(<UndoToast todoText={longText} onUndo={mockOnUndo} onDismiss={mockOnDismiss} />);

    // slice(0, 30) = 'This is a very long todo item ' + '...'
    expect(screen.getByText(/This is a very long todo item \.\.\./)).toBeInTheDocument();
  });

  it('should not truncate text with 30 or fewer characters', () => {
    const shortText = 'Short task';
    render(<UndoToast todoText={shortText} onUndo={mockOnUndo} onDismiss={mockOnDismiss} />);

    expect(screen.getByText(/Short task/)).toBeInTheDocument();
    expect(screen.queryByText(/\.\.\./)).not.toBeInTheDocument();
  });

  it('should render Undo button', () => {
    render(<UndoToast todoText="Task" onUndo={mockOnUndo} onDismiss={mockOnDismiss} />);

    expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
  });

  it('should render Dismiss button', () => {
    render(<UndoToast todoText="Task" onUndo={mockOnUndo} onDismiss={mockOnDismiss} />);

    // Dismiss button has ✕ text
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('should call onUndo when Undo button is clicked', () => {
    render(<UndoToast todoText="Task" onUndo={mockOnUndo} onDismiss={mockOnDismiss} />);

    fireEvent.click(screen.getByRole('button', { name: /undo/i }));
    expect(mockOnUndo).toHaveBeenCalledTimes(1);
  });

  it('should call onDismiss when dismiss button is clicked', () => {
    render(<UndoToast todoText="Task" onUndo={mockOnUndo} onDismiss={mockOnDismiss} />);

    // The dismiss button is the one with ✕
    const buttons = screen.getAllByRole('button');
    const dismissBtn = buttons.find((btn) => btn.textContent === '✕');
    expect(dismissBtn).toBeDefined();
    fireEvent.click(dismissBtn!);
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('should render progress bar', () => {
    const { container } = render(
      <UndoToast todoText="Task" onUndo={mockOnUndo} onDismiss={mockOnDismiss} />
    );

    expect(container.querySelector('.undo-toast-progress')).toBeInTheDocument();
    expect(container.querySelector('.undo-toast-progress-bar')).toBeInTheDocument();
  });

  it('should decrease progress over time', () => {
    const { container } = render(
      <UndoToast todoText="Task" onUndo={mockOnUndo} onDismiss={mockOnDismiss} />
    );

    const progressBar = container.querySelector('.undo-toast-progress-bar') as HTMLElement;
    expect(progressBar.style.width).toBe('100%');

    // Advance time by 2.5 seconds (half of 5000ms duration)
    act(() => {
      jest.advanceTimersByTime(2500);
    });

    const widthAfterHalf = parseFloat(progressBar.style.width);
    expect(widthAfterHalf).toBeLessThan(100);
    expect(widthAfterHalf).toBeGreaterThan(0);
  });

  it('should reach 0% progress after full duration', () => {
    const { container } = render(
      <UndoToast todoText="Task" onUndo={mockOnUndo} onDismiss={mockOnDismiss} />
    );

    const progressBar = container.querySelector('.undo-toast-progress-bar') as HTMLElement;

    act(() => {
      jest.advanceTimersByTime(5100);
    });

    const finalWidth = parseFloat(progressBar.style.width);
    expect(finalWidth).toBe(0);
  });
});
