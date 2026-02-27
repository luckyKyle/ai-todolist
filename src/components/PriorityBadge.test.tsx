import { render, screen } from '@testing-library/react';
import { PriorityBadge } from './PriorityBadge';

describe('PriorityBadge', () => {
  it('should render high priority badge with correct styles', () => {
    render(<PriorityBadge priority="high" />);

    const badge = screen.getByText('High');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('priority-badge-high');
  });

  it('should render medium priority badge with correct styles', () => {
    render(<PriorityBadge priority="medium" />);

    const badge = screen.getByText('Medium');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('priority-badge-medium');
  });

  it('should render low priority badge with correct styles', () => {
    render(<PriorityBadge priority="low" />);

    const badge = screen.getByText('Low');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('priority-badge-low');
  });

  it('should have correct CSS class for high priority', () => {
    render(<PriorityBadge priority="high" />);

    const badge = screen.getByText('High');
    expect(badge).toHaveClass('priority-badge', 'priority-badge-high');
  });

  it('should have correct CSS class for medium priority', () => {
    render(<PriorityBadge priority="medium" />);

    const badge = screen.getByText('Medium');
    expect(badge).toHaveClass('priority-badge', 'priority-badge-medium');
  });

  it('should have correct CSS class for low priority', () => {
    render(<PriorityBadge priority="low" />);

    const badge = screen.getByText('Low');
    expect(badge).toHaveClass('priority-badge', 'priority-badge-low');
  });

  it('should be accessible with appropriate aria-label', () => {
    render(<PriorityBadge priority="high" />);

    const badge = screen.getByLabelText('High Priority');
    expect(badge).toBeInTheDocument();
  });
});
