import { render, screen, fireEvent } from '@testing-library/react';
import { TodoInput } from './TodoInput';

describe('TodoInput', () => {
  const mockOnAdd = jest.fn().mockReturnValue(true);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render an input field', () => {
    render(<TodoInput onAdd={mockOnAdd} />);

    const input = screen.getByLabelText('Add a new todo');
    expect(input).toBeInTheDocument();
  });

  it('should render an add button', () => {
    render(<TodoInput onAdd={mockOnAdd} />);

    const button = screen.getByRole('button', { name: /add todo/i });
    expect(button).toBeInTheDocument();
  });

  it('should call onAdd when button is clicked with input value', () => {
    render(<TodoInput onAdd={mockOnAdd} />);

    const input = screen.getByLabelText('Add a new todo');
    const button = screen.getByRole('button', { name: /add todo/i });

    fireEvent.change(input, { target: { value: 'New todo' } });
    fireEvent.click(button);

    expect(mockOnAdd).toHaveBeenCalledWith('New todo', 'medium', []);
    expect(input).toHaveValue('');
  });

  it('should call onAdd when Enter key is pressed', () => {
    render(<TodoInput onAdd={mockOnAdd} />);

    const input = screen.getByLabelText('Add a new todo');

    fireEvent.change(input, { target: { value: 'New todo' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockOnAdd).toHaveBeenCalledWith('New todo', 'medium', []);
    expect(input).toHaveValue('');
  });

  it('should not call onAdd when input is empty', () => {
    render(<TodoInput onAdd={mockOnAdd} />);

    const button = screen.getByRole('button', { name: /add todo/i });
    fireEvent.click(button);

    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('should not call onAdd when Enter is pressed with empty input', () => {
    render(<TodoInput onAdd={mockOnAdd} />);

    const input = screen.getByLabelText('Add a new todo');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('should render priority selector with medium selected by default', () => {
    render(<TodoInput onAdd={mockOnAdd} />);

    const mediumBtn = screen.getByLabelText('Set priority to medium');
    expect(mediumBtn).toHaveClass('active');
  });

  it('should allow selecting a different priority', () => {
    render(<TodoInput onAdd={mockOnAdd} />);

    const highBtn = screen.getByLabelText('Set priority to high');
    fireEvent.click(highBtn);
    expect(highBtn).toHaveClass('active');

    const input = screen.getByLabelText('Add a new todo');
    fireEvent.change(input, { target: { value: 'High priority task' } });
    fireEvent.click(screen.getByRole('button', { name: /add todo/i }));

    expect(mockOnAdd).toHaveBeenCalledWith('High priority task', 'high', []);
  });

  it('should allow adding tags', () => {
    render(<TodoInput onAdd={mockOnAdd} />);

    const tagInput = screen.getByLabelText('Add tags');
    fireEvent.change(tagInput, { target: { value: 'urgent' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });

    expect(screen.getByText('urgent')).toBeInTheDocument();

    const input = screen.getByLabelText('Add a new todo');
    fireEvent.change(input, { target: { value: 'Tagged task' } });
    fireEvent.click(screen.getByRole('button', { name: /add todo/i }));

    expect(mockOnAdd).toHaveBeenCalledWith('Tagged task', 'medium', ['urgent']);
  });

  it('should show duplicate warning when onAdd returns false', () => {
    const mockOnAddDuplicate = jest.fn().mockReturnValue(false);
    render(<TodoInput onAdd={mockOnAddDuplicate} />);

    const input = screen.getByLabelText('Add a new todo');
    fireEvent.change(input, { target: { value: 'Existing todo' } });
    fireEvent.click(screen.getByRole('button', { name: /add todo/i }));

    expect(screen.getByRole('alert')).toHaveTextContent('"Existing todo" already exists');
    expect(input).toHaveValue('Existing todo');
  });

  it('should clear duplicate warning when user types', () => {
    const mockOnAddDuplicate = jest.fn().mockReturnValue(false);
    render(<TodoInput onAdd={mockOnAddDuplicate} />);

    const input = screen.getByLabelText('Add a new todo');
    fireEvent.change(input, { target: { value: 'Dup' } });
    fireEvent.click(screen.getByRole('button', { name: /add todo/i }));

    expect(screen.getByRole('alert')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'Dup2' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
