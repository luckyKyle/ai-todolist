import { type FC, useMemo } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pages = useMemo(() => {
    const result: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) result.push(i);
      return result;
    }

    // Always show first page
    result.push(1);

    if (currentPage > 3) {
      result.push('ellipsis-start');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      result.push(i);
    }

    if (currentPage < totalPages - 2) {
      result.push('ellipsis-end');
    }

    // Always show last page
    result.push(totalPages);

    return result;
  }, [currentPage, totalPages]);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        className="pagination-btn pagination-arrow"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        <span className="pagination-chevron left" />
      </button>

      {pages.map((page) =>
        typeof page === 'string' ? (
          <span key={page} className="pagination-ellipsis">
            …
          </span>
        ) : (
          <button
            key={page}
            className={`pagination-btn${page === currentPage ? ' active' : ''}`}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        className="pagination-btn pagination-arrow"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        <span className="pagination-chevron right" />
      </button>
    </nav>
  );
};
