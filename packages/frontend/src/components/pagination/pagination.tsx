import { ChevronLeft, ChevronRight } from "../icons/icons";
import { component$, $, Signal } from "@builder.io/qwik";
import { cn } from "~/common/utils";

interface PaginationProps {
  totalPages: number;
  currentPage: Signal<number>;
}

export const Pagination = component$<PaginationProps>(
  ({ totalPages, currentPage }) => {
    const handlePageClick = $((newPage: number) => {
      currentPage.value = newPage;
    });

    return (
      <div class="flex justify-center space-x-2 mt-4">
        {/* Previous Button */}
        <button
          onClick$={() => handlePageClick(currentPage.value - 1)}
          disabled={currentPage.value === 1}
          class={cn(
            "p-2 rounded",
            "bg-transparent hover:bg-soft",
            "cursor-pointer disabled:cursor-not-allowed",
            "transition-[background-color] duration-150 ease-linear text-text",
          )}
        >
          <ChevronLeft />
        </button>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick$={() => handlePageClick(page)}
            class={cn(
              "w-8 h-10 rounded",
              page === currentPage.value
                ? "bg-primary text-white"
                : "border border-soft text-text hover:brightness-75 dark:hover:brightness-125 duration-200 ease-out",
            )}
          >
            {page}
          </button>
        ))}

        {/* Next Button */}
        <button
          onClick$={() => handlePageClick(currentPage.value + 1)}
          disabled={currentPage.value === totalPages}
          class={cn(
            "p-2 rounded",
            "bg-transparent hover:bg-soft",
            "cursor-pointer disabled:cursor-not-allowed",
            "transition-[background-color] duration-150 ease-linear text-text",
          )}
        >
          <ChevronRight />
        </button>
      </div>
    );
  },
);
