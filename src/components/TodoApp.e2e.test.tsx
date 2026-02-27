import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TodoApp } from './TodoApp';

describe('TodoApp e2e persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('persists theme and todos across page reload (unmount/remount)', async () => {
    const { unmount } = render(<TodoApp />);

    const input = screen.getByRole('textbox', { name: /add a new todo/i });
    const addButton = screen.getByRole('button', { name: /add todo/i });

    fireEvent.change(input, { target: { value: 'E2E persisted todo' } });
    fireEvent.click(addButton);

    const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(themeToggle);

    await waitFor(() => {
      const rawTodos = localStorage.getItem('todos');
      expect(rawTodos).not.toBeNull();
      const parsed = JSON.parse(rawTodos!);
      expect(parsed.data.some((todo: { text: string }) => todo.text === 'E2E persisted todo')).toBe(true);
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    unmount();
    render(<TodoApp />);

    expect(await screen.findByText('E2E persisted todo')).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });
});
