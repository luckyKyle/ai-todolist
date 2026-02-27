import { render, screen, fireEvent } from '@testing-library/react';
import { TodoToolbar } from './TodoToolbar';
import type { Priority } from '../types';

describe('TodoToolbar', () => {
  const defaultProps = {
    filter: 'all' as const,
    searchQuery: '',
    priorityFilter: new Set<Priority>(),
    onFilterChange: jest.fn(),
    onSearchChange: jest.fn(),
    onPriorityFilterToggle: jest.fn(),
    onCompleteAll: jest.fn(),
    onClearCompleted: jest.fn(),
    totalCount: 5,
    completedCount: 2,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Search', () => {
    it('should render search input', () => {
      render(<TodoToolbar {...defaultProps} />);

      expect(screen.getByRole('textbox', { name: 'Search todos' })).toBeInTheDocument();
    });

    it('should display current search query', () => {
      render(<TodoToolbar {...defaultProps} searchQuery="buy" />);

      expect(screen.getByRole('textbox', { name: 'Search todos' })).toHaveValue('buy');
    });

    it('should call onSearchChange when typing', () => {
      render(<TodoToolbar {...defaultProps} />);

      fireEvent.change(screen.getByRole('textbox', { name: 'Search todos' }), {
        target: { value: 'test' },
      });
      expect(defaultProps.onSearchChange).toHaveBeenCalledWith('test');
    });

    it('should show clear button when search query is not empty', () => {
      render(<TodoToolbar {...defaultProps} searchQuery="test" />);

      expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
    });

    it('should not show clear button when search query is empty', () => {
      render(<TodoToolbar {...defaultProps} searchQuery="" />);

      expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
    });

    it('should call onSearchChange with empty string when clear button is clicked', () => {
      render(<TodoToolbar {...defaultProps} searchQuery="test" />);

      fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
      expect(defaultProps.onSearchChange).toHaveBeenCalledWith('');
    });
  });

  describe('Status Filters', () => {
    it('should render All, Active, Done filter buttons', () => {
      render(<TodoToolbar {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Filter: All' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Filter: Active' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Filter: Done' })).toBeInTheDocument();
    });

    it('should highlight active filter', () => {
      render(<TodoToolbar {...defaultProps} filter="active" />);

      expect(screen.getByRole('button', { name: 'Filter: Active' })).toHaveClass('active');
      expect(screen.getByRole('button', { name: 'Filter: All' })).not.toHaveClass('active');
    });

    it('should call onFilterChange when filter button is clicked', () => {
      render(<TodoToolbar {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: 'Filter: Active' }));
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith('active');
    });

    it('should call onFilterChange with completed', () => {
      render(<TodoToolbar {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: 'Filter: Done' }));
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith('completed');
    });
  });

  describe('Priority Filters', () => {
    it('should render High, Medium, Low priority filter buttons', () => {
      render(<TodoToolbar {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Filter priority: High' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Filter priority: Medium' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Filter priority: Low' })).toBeInTheDocument();
    });

    it('should highlight active priority filter', () => {
      const priorityFilter = new Set<Priority>(['high']);
      render(<TodoToolbar {...defaultProps} priorityFilter={priorityFilter} />);

      expect(screen.getByRole('button', { name: 'Filter priority: High' })).toHaveClass('active');
      expect(screen.getByRole('button', { name: 'Filter priority: Medium' })).not.toHaveClass('active');
    });

    it('should highlight multiple active priority filters', () => {
      const priorityFilter = new Set<Priority>(['high', 'low']);
      render(<TodoToolbar {...defaultProps} priorityFilter={priorityFilter} />);

      expect(screen.getByRole('button', { name: 'Filter priority: High' })).toHaveClass('active');
      expect(screen.getByRole('button', { name: 'Filter priority: Low' })).toHaveClass('active');
      expect(screen.getByRole('button', { name: 'Filter priority: Medium' })).not.toHaveClass('active');
    });

    it('should call onPriorityFilterToggle when priority button is clicked', () => {
      render(<TodoToolbar {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: 'Filter priority: High' }));
      expect(defaultProps.onPriorityFilterToggle).toHaveBeenCalledWith('high');
    });
  });

  describe('Action Buttons', () => {
    it('should render Complete All button', () => {
      render(<TodoToolbar {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Complete all todos' })).toBeInTheDocument();
      expect(screen.getByText('Complete All')).toBeInTheDocument();
    });

    it('should show Uncomplete All when all tasks are completed', () => {
      render(<TodoToolbar {...defaultProps} totalCount={5} completedCount={5} />);

      expect(screen.getByRole('button', { name: 'Uncomplete all todos' })).toBeInTheDocument();
      expect(screen.getByText('Uncomplete All')).toBeInTheDocument();
    });

    it('should call onCompleteAll when Complete All is clicked', () => {
      render(<TodoToolbar {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: 'Complete all todos' }));
      expect(defaultProps.onCompleteAll).toHaveBeenCalledTimes(1);
    });

    it('should disable Complete All when totalCount is 0', () => {
      render(<TodoToolbar {...defaultProps} totalCount={0} completedCount={0} />);

      expect(screen.getByRole('button', { name: 'Complete all todos' })).toBeDisabled();
    });

    it('should render Clear Done button', () => {
      render(<TodoToolbar {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Clear completed todos' })).toBeInTheDocument();
      expect(screen.getByText('Clear Done')).toBeInTheDocument();
    });

    it('should call onClearCompleted when Clear Done is clicked', () => {
      render(<TodoToolbar {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: 'Clear completed todos' }));
      expect(defaultProps.onClearCompleted).toHaveBeenCalledTimes(1);
    });

    it('should disable Clear Done when completedCount is 0', () => {
      render(<TodoToolbar {...defaultProps} completedCount={0} />);

      expect(screen.getByRole('button', { name: 'Clear completed todos' })).toBeDisabled();
    });

    it('should enable Clear Done when completedCount > 0', () => {
      render(<TodoToolbar {...defaultProps} completedCount={3} />);

      expect(screen.getByRole('button', { name: 'Clear completed todos' })).not.toBeDisabled();
    });
  });
});
