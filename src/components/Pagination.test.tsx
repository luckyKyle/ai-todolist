import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  const mockOnPageChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render navigation with correct aria-label', () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={mockOnPageChange} />);

    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });

  it('should render all page buttons when totalPages <= 7', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);

    for (let i = 1; i <= 5; i++) {
      expect(screen.getByRole('button', { name: String(i) })).toBeInTheDocument();
    }
  });

  it('should highlight the current page with active class', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);

    const activeBtn = screen.getByRole('button', { name: '3' });
    expect(activeBtn).toHaveClass('active');
    expect(activeBtn).toHaveAttribute('aria-current', 'page');
  });

  it('should not set aria-current on non-active pages', () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />);

    const btn = screen.getByRole('button', { name: '1' });
    expect(btn).not.toHaveAttribute('aria-current');
  });

  it('should call onPageChange when clicking a page button', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);

    fireEvent.click(screen.getByRole('button', { name: '3' }));
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  it('should call onPageChange with previous page when clicking Previous', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('should call onPageChange with next page when clicking Next', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(mockOnPageChange).toHaveBeenCalledWith(4);
  });

  it('should disable Previous button on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
  });

  it('should disable Next button on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={mockOnPageChange} />);

    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('should enable both arrows on a middle page', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);

    expect(screen.getByRole('button', { name: 'Previous page' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).not.toBeDisabled();
  });

  describe('ellipsis for many pages (totalPages > 7)', () => {
    it('should show end ellipsis when on first page', () => {
      render(<Pagination currentPage={1} totalPages={20} onPageChange={mockOnPageChange} />);

      // Should show: 1 2 3 ... 20
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument();
      expect(screen.getAllByText('…')).toHaveLength(1);
    });

    it('should show start ellipsis when near last page', () => {
      render(<Pagination currentPage={20} totalPages={20} onPageChange={mockOnPageChange} />);

      // Should show: 1 ... 19 20
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '19' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument();
      expect(screen.getAllByText('…')).toHaveLength(1);
    });

    it('should show both ellipses when on a middle page', () => {
      render(<Pagination currentPage={10} totalPages={20} onPageChange={mockOnPageChange} />);

      // Should show: 1 ... 9 10 11 ... 20
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '9' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '11' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument();
      expect(screen.getAllByText('…')).toHaveLength(2);
    });

    it('should not show start ellipsis when currentPage is 3', () => {
      render(<Pagination currentPage={3} totalPages={20} onPageChange={mockOnPageChange} />);

      // Should show: 1 2 3 4 ... 20 (no start ellipsis)
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
      expect(screen.getAllByText('…')).toHaveLength(1);
    });

    it('should not show end ellipsis when currentPage is totalPages - 2', () => {
      render(<Pagination currentPage={18} totalPages={20} onPageChange={mockOnPageChange} />);

      // Should show: 1 ... 17 18 19 20 (no end ellipsis)
      expect(screen.getByRole('button', { name: '17' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '18' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '19' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument();
      expect(screen.getAllByText('…')).toHaveLength(1);
    });
  });

  it('should render correctly with exactly 1 page', () => {
    render(<Pagination currentPage={1} totalPages={1} onPageChange={mockOnPageChange} />);

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('should render correctly with exactly 7 pages (no ellipsis)', () => {
    render(<Pagination currentPage={4} totalPages={7} onPageChange={mockOnPageChange} />);

    for (let i = 1; i <= 7; i++) {
      expect(screen.getByRole('button', { name: String(i) })).toBeInTheDocument();
    }
    expect(screen.queryByText('…')).not.toBeInTheDocument();
  });
});
