import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TodoApp } from './TodoApp';

jest.mock('../utils/localStorage', () => ({
  saveTodos: jest.fn(),
  loadTodos: jest.fn(() => []),
  saveTheme: jest.fn(),
  loadTheme: jest.fn(() => null),
}));

const mockedLocalStorage = jest.requireMock('../utils/localStorage') as {
  saveTodos: jest.Mock;
  loadTodos: jest.Mock;
  saveTheme: jest.Mock;
  loadTheme: jest.Mock;
};

describe('TodoApp - storage integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.documentElement.removeAttribute('data-theme');
    mockedLocalStorage.loadTodos.mockReturnValue([]);
    mockedLocalStorage.loadTheme.mockReturnValue(null);
  });

  it('loads todos from storage on mount', async () => {
    mockedLocalStorage.loadTodos.mockReturnValue([
      { id: '1', text: 'Stored todo', completed: false },
    ]);

    render(<TodoApp />);

    await waitFor(() => {
      expect(mockedLocalStorage.loadTodos).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText('Stored todo')).toBeInTheDocument();
  });

  it('persists todos to storage when a new todo is added', async () => {
    render(<TodoApp />);

    const input = screen.getByRole('textbox', { name: /add a new todo/i });
    const button = screen.getByRole('button', { name: /add todo/i });

    fireEvent.change(input, { target: { value: 'New stored todo' } });
    fireEvent.click(button);

    await waitFor(() => {
      const savedCalls = mockedLocalStorage.saveTodos.mock.calls;
      expect(savedCalls.length).toBeGreaterThanOrEqual(1);

      const lastCall = savedCalls[savedCalls.length - 1][0];
      expect(Array.isArray(lastCall)).toBe(true);
      expect(lastCall.some((todo: { text: string }) => todo.text === 'New stored todo')).toBe(true);
    });
  });

  it('shows correct stats text when todos are present', async () => {
    mockedLocalStorage.loadTodos.mockReturnValue([
      { id: '1', text: 'Task 1', completed: false },
      { id: '2', text: 'Task 2', completed: true },
    ]);

    render(<TodoApp />);

    expect(
      await screen.findByText('1 of 2 tasks completed'),
    ).toBeInTheDocument();
  });

  it('loads theme from storage on mount and applies it to document', async () => {
    mockedLocalStorage.loadTheme.mockReturnValue('dark');

    render(<TodoApp />);

    await waitFor(() => {
      expect(mockedLocalStorage.loadTheme).toHaveBeenCalledTimes(1);
    });

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });
});
