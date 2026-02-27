import { render, screen, fireEvent } from '@testing-library/react';
import { TagChip } from './TagChip';

describe('TagChip', () => {
  it('should render the tag text', () => {
    render(<TagChip tag="react" />);

    expect(screen.getByText('react')).toBeInTheDocument();
  });

  it('should render the hash symbol', () => {
    render(<TagChip tag="react" />);

    expect(screen.getByText('#')).toBeInTheDocument();
  });

  it('should have correct aria-label', () => {
    render(<TagChip tag="typescript" />);

    expect(screen.getByLabelText('Tag: typescript')).toBeInTheDocument();
  });

  it('should set title attribute for tooltip', () => {
    render(<TagChip tag="javascript" />);

    expect(screen.getByLabelText('Tag: javascript')).toHaveAttribute('title', 'javascript');
  });

  it('should set data-tag-color based on tag hash', () => {
    render(<TagChip tag="react" />);

    const chip = screen.getByLabelText('Tag: react');
    const colorIndex = chip.getAttribute('data-tag-color');
    expect(colorIndex).toBeDefined();
    expect(Number(colorIndex)).toBeGreaterThanOrEqual(0);
    expect(Number(colorIndex)).toBeLessThan(8);
  });

  it('should produce consistent color for the same tag', () => {
    const { unmount } = render(<TagChip tag="react" />);
    const color1 = screen.getByLabelText('Tag: react').getAttribute('data-tag-color');
    unmount();

    render(<TagChip tag="react" />);
    const color2 = screen.getByLabelText('Tag: react').getAttribute('data-tag-color');

    expect(color1).toBe(color2);
  });

  it('should not render remove button when onRemove is not provided', () => {
    render(<TagChip tag="react" />);

    expect(screen.queryByRole('button', { name: /remove tag/i })).not.toBeInTheDocument();
  });

  it('should render remove button when onRemove is provided', () => {
    const mockOnRemove = jest.fn();
    render(<TagChip tag="react" onRemove={mockOnRemove} />);

    expect(screen.getByRole('button', { name: 'Remove tag react' })).toBeInTheDocument();
  });

  it('should call onRemove with tag name when remove button is clicked', () => {
    const mockOnRemove = jest.fn();
    render(<TagChip tag="react" onRemove={mockOnRemove} />);

    fireEvent.click(screen.getByRole('button', { name: 'Remove tag react' }));
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
    expect(mockOnRemove).toHaveBeenCalledWith('react');
  });

  it('should render different colors for different tags', () => {
    const { unmount } = render(<TagChip tag="react" />);
    const color1 = screen.getByLabelText('Tag: react').getAttribute('data-tag-color');
    unmount();

    render(<TagChip tag="vue" />);
    const color2 = screen.getByLabelText('Tag: vue').getAttribute('data-tag-color');

    // Different tags should (likely) produce different colors
    // This is probabilistic, but 'react' and 'vue' do hash differently
    expect(color1).not.toBe(color2);
  });
});
