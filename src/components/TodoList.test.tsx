import { render, screen, fireEvent } from '@testing-library/react';
import { TodoList } from './TodoList';

// Mock TodoItem to isolate TodoList testing
jest.mock('./TodoItem', () => ({
  TodoItem: ({ todo, onToggle, onDelete, onEdit }: any) => (
    <li data-testid={`todo-item-${todo.id}`}>
      <span>{todo.text}</span>
      <button onClick={() => onToggle(todo.id)}>Toggle</button>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
      <button onClick={() => onEdit(todo.id, { text: 'edited' })}>Edit</button>
    </li>
  ),
}));

describe('TodoList', () => {
  const mockTodos = [
    { id: '1', text: 'Learn TDD', completed: false },
    { id: '2', text: 'Build Todolist', completed: true },
  ];

  const mockOnToggle = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnReorder = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render a list of todos', () => {
    render(
      <TodoList
        todos={mockTodos}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onReorder={mockOnReorder}
        isDragEnabled={false}
      />
    );

    expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('todo-item-2')).toBeInTheDocument();
  });

  it('should show message when there are no todos', () => {
    render(
      <TodoList
        todos={[]}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onReorder={mockOnReorder}
        isDragEnabled={false}
      />
    );

    expect(screen.getByText('Your slate is clean')).toBeInTheDocument();
  });

  it('should pass toggle handler to TodoItem components', () => {
    render(
      <TodoList
        todos={mockTodos}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onReorder={mockOnReorder}
        isDragEnabled={false}
      />
    );

    const toggleButton = screen.getAllByText('Toggle')[0];
    fireEvent.click(toggleButton);

    expect(mockOnToggle).toHaveBeenCalledWith('1');
  });

  it('should pass delete handler to TodoItem components', () => {
    render(
      <TodoList
        todos={mockTodos}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onReorder={mockOnReorder}
        isDragEnabled={false}
      />
    );

    const deleteButton = screen.getAllByText('Delete')[0];
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('should pass edit handler to TodoItem components', () => {
    render(
      <TodoList
        todos={mockTodos}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onReorder={mockOnReorder}
        isDragEnabled={false}
      />
    );

    const editButton = screen.getAllByText('Edit')[0];
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith('1', { text: 'edited' });
  });
});
