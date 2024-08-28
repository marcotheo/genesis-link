import { component$, $, useSignal } from "@builder.io/qwik";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination = component$<PaginationProps>(
  ({ totalPages, currentPage, onPageChange }) => {
    const handlePageClick = $((page: number) => {
      onPageChange(page);
    });

    return (
      <div class="flex justify-center space-x-2 mt-4">
        {/* Previous Button */}
        <button
          onClick$={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          class="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick$={() => handlePageClick(page)}
            class={`px-4 py-2 rounded ${page === currentPage ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            {page}
          </button>
        ))}

        {/* Next Button */}
        <button
          onClick$={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          class="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  },
);
