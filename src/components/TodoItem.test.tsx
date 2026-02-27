import { render, screen, fireEvent } from '@testing-library/react';
import { TodoItem } from './TodoItem';

describe('TodoItem', () => {
  const mockTodo = {
    id: '1',
    text: 'Learn TDD',
    completed: false,
  };

  const mockOnToggle = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDragStart = jest.fn();
  const mockOnDragOver = jest.fn();
  const mockOnDrop = jest.fn();

  const defaultProps = {
    onToggle: mockOnToggle,
    onDelete: mockOnDelete,
    onEdit: mockOnEdit,
    index: 0,
    isDragEnabled: false,
    onDragStart: mockOnDragStart,
    onDragOver: mockOnDragOver,
    onDrop: mockOnDrop,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the todo text', () => {
    render(<TodoItem todo={mockTodo} {...defaultProps} />);
    expect(screen.getByText('Learn TDD')).toBeInTheDocument();
  });

  it('should render a checkbox for toggling completion', () => {
    render(<TodoItem todo={mockTodo} {...defaultProps} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('should call onToggle when checkbox is clicked', () => {
    render(<TodoItem todo={mockTodo} {...defaultProps} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockOnToggle).toHaveBeenCalledWith('1');
  });

  it('should render a delete button', () => {
    render(<TodoItem todo={mockTodo} {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked', () => {
    render(<TodoItem todo={mockTodo} {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('should show completed style when todo is completed', () => {
    const completedTodo = { ...mockTodo, completed: true };

    render(<TodoItem todo={completedTodo} {...defaultProps} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();

    const todoText = screen.getByText('Learn TDD');
    expect(todoText).toHaveClass('completed');
  });

  it('should show drag handle when drag is enabled', () => {
    render(<TodoItem todo={mockTodo} {...defaultProps} isDragEnabled={true} />);
    expect(screen.getByLabelText('Drag to reorder')).toBeInTheDocument();
  });

  it('should not show drag handle when drag is disabled', () => {
    render(<TodoItem todo={mockTodo} {...defaultProps} isDragEnabled={false} />);
    expect(screen.queryByLabelText('Drag to reorder')).not.toBeInTheDocument();
  });

  it('should enter edit mode on edit button click', () => {
    render(<TodoItem todo={mockTodo} {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(screen.getByLabelText('Edit todo text')).toBeInTheDocument();
  });

  it('should show tags when todo has tags', () => {
    const todoWithTags = { ...mockTodo, tags: ['work', 'urgent'] };
    render(<TodoItem todo={todoWithTags} {...defaultProps} />);

    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
  });

  it('should always show priority badge', () => {
    render(<TodoItem todo={mockTodo} {...defaultProps} />);
    expect(screen.getByLabelText('Medium Priority (click to change)')).toBeInTheDocument();
  });

  it('should commit tag input on blur in edit mode', () => {
    const todoWithTags = { ...mockTodo, tags: ['work'] };
    render(<TodoItem todo={todoWithTags} {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    const tagInput = screen.getByLabelText('Edit tags');
    fireEvent.change(tagInput, { target: { value: 'newTag' } });
    fireEvent.blur(tagInput);

    expect(screen.getByText('newTag')).toBeInTheDocument();
  });
});
