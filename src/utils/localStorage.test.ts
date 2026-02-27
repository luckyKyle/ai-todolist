import {
  saveTodos,
  loadTodos,
  saveTheme,
  loadTheme,
  clearAllData,
  StorageError,
} from './localStorage';

describe('localStorage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it('saves and loads todos with versioned envelope', () => {
    const todos = [
      { id: '1', text: 'Task 1', completed: false },
      { id: '2', text: 'Task 2', completed: true },
    ];

    saveTodos(todos);

    const raw = localStorage.getItem('todos');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);

    expect(parsed.version).toBe(1);
    expect(Array.isArray(parsed.data)).toBe(true);
    expect(parsed.data).toHaveLength(2);

    const loaded = loadTodos();
    expect(loaded).toEqual(todos);
  });

  it('returns empty array when no todos are stored', () => {
    const loaded = loadTodos();
    expect(loaded).toEqual([]);
  });

  it('migrates legacy plain array format', () => {
    const legacyTodos = [
      { id: '1', text: 'Legacy task', completed: false },
      { id: '2', text: 'Another', completed: true },
    ];
    localStorage.setItem('todos', JSON.stringify(legacyTodos));

    const loaded = loadTodos();
    expect(loaded).toEqual(legacyTodos);
  });

  it('filters out invalid items from legacy format', () => {
    const mixed = [
      { id: '1', text: 'Valid', completed: false },
      { invalid: true },
      'not an object',
    ];
    localStorage.setItem('todos', JSON.stringify(mixed));

    const loaded = loadTodos();
    expect(loaded).toEqual([{ id: '1', text: 'Valid', completed: false }]);
  });

  it('can read data from old todos_v1 key', () => {
    const wrapped = {
      version: 1,
      timestamp: new Date().toISOString(),
      data: [{ id: 'v1', text: 'from old key', completed: false }],
    };
    localStorage.setItem('todos_v1', JSON.stringify(wrapped));

    const loaded = loadTodos();
    expect(loaded).toEqual([{ id: 'v1', text: 'from old key', completed: false }]);
  });

  it('wraps errors from saveTodos in StorageError', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });

    expect(() => saveTodos([])).toThrow(StorageError);
    expect(() => saveTodos([])).toThrow(
      /LocalStorage quota exceeded\. Unable to save todos\./,
    );
  });

  it('wraps generic errors from loadTodos in StorageError', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('boom');
    });

    expect(() => loadTodos()).toThrow(StorageError);
    expect(() => loadTodos()).toThrow(/Failed to load todos:/);
  });

  it('saves and loads theme', () => {
    saveTheme('dark');
    expect(localStorage.getItem('theme')).toBe('dark');

    const theme = loadTheme();
    expect(theme).toBe('dark');
  });

  it('returns null for invalid theme value', () => {
    localStorage.setItem('theme', 'invalid');
    const theme = loadTheme();
    expect(theme).toBeNull();
  });

  it('wraps theme save quota errors in StorageError', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });

    expect(() => saveTheme('dark')).toThrow(StorageError);
    expect(() => saveTheme('dark')).toThrow(
      /LocalStorage quota exceeded\. Unable to save theme\./,
    );
  });

  it('clears all known keys with clearAllData', () => {
    saveTodos([{ id: '1', text: 'test', completed: false }]);
    saveTheme('dark');

    clearAllData();

    expect(localStorage.getItem('todos')).toBeNull();
    expect(localStorage.getItem('todos_v1')).toBeNull();
    expect(localStorage.getItem('theme')).toBeNull();
  });
});
