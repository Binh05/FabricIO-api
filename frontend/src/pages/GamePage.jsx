/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import FilterBar from "../components/FilterBar";
import TaskPagination from "@/components/TaskPagination";
import GameLibrarySection from "@/sections/GameLibrarySection";

import useHomeFeed from "../hooks/useHomeFeed";
import { useProducts } from "@/hooks/useLibraryGame";

import { RotateCcw } from "lucide-react";

export default function GamePage() {
  const { error } = useHomeFeed();

  const [searchParams, setSearchParams] = useSearchParams();

  const tagFromUrl = searchParams.get("tag") || "";
  const searchFromUrl = searchParams.get("search") || "";

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 12;


  const {
    filters,
    setFilters,
    filteredProducts,
    resetFilters,
    total,
    loading,
  } = useProducts(page, pageSize);


  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      tag: tagFromUrl,
      search: searchFromUrl,
    }));
  }, [tagFromUrl, searchFromUrl, setFilters]);

  // Reset filters 
  useEffect(() => {
    setPage(1);
  }, [filters]);


  const totalPages = Math.ceil(total / pageSize);


  const handleNext = () => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrev = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handlePageChange = (p) => {
    setPage(p);
  };

  // Reset filters
  const handleResetFilters = () => {
    resetFilters();
    setSearchParams({});
    setPage(1);
  };

  // Loading UI
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <Header />

        <div className="flex me-4">
          <Sidebar />

          <main className="flex-1">
            <div className="space-y-8 px-4 py-6 lg:p-0">
              <div className="h-[260px] animate-pulse rounded-[32px] border border-white/10 bg-white/5" />

              <div className="h-[80px] animate-pulse rounded-[24px] border border-white/10 bg-white/5" />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[300px] animate-pulse rounded-[28px] border border-white/10 bg-white/5"
                  />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <Header />

        <div className="flex me-4">
          <Sidebar />

          <main className="flex-1">
            <div className="px-4 py-6 lg:p-0">
              <div className="rounded-[28px] border border-red-500/20 bg-red-500/10 p-6 text-red-200">
                Không thể tải thư viện game: {error}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Header />

      <div className="flex me-4">
        <Sidebar />

        <main className="flex-1">
          <div className="space-y-8 px-4 py-6 lg:p-0">
            {/* Filter Section */}
            <section className="relative z-30 rounded-[28px] border border-white/10 bg-[#111113]/80 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6">
              <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold text-white">
                    Bộ lọc
                  </h1>

                  <p className="mt-2 text-sm text-zinc-400">
                    Tinh chỉnh danh sách game theo nhu cầu của bạn.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="group flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                >
                  <RotateCcw
                    size={16}
                    strokeWidth={2.5}
                    className="text-zinc-500 transition duration-500 group-hover:-rotate-180 group-hover:text-red-300"
                  />

                  Đặt lại bộ lọc
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <FilterBar filters={filters} setFilters={setFilters} />
              </div>
            </section>

            {/* Games Section */}
            <section className="relative z-10 rounded-[28px] border border-white/10 bg-[#111113]/80 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6">
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                {totalPages > 1 && (
                  <span className="w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-400">
                    Trang {page} / {totalPages}
                  </span>
                )}
              </div>

              {filteredProducts.length > 0 ? (
                <GameLibrarySection games={filteredProducts} />
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 px-6 py-16 text-center">
                  <p className="text-lg font-bold text-white">
                    Không tìm thấy game phù hợp
                  </p>

                  <p className="mt-2 text-sm text-zinc-500">
                    Thử reset bộ lọc hoặc chọn tag khác.
                  </p>
                </div>
              )}
            </section>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="rounded-[28px] border border-white/10 bg-[#111113]/80 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                <TaskPagination
                  handleNext={handleNext}
                  handlePrev={handlePrev}
                  handlePageChange={handlePageChange}
                  page={page}
                  totalPages={totalPages}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
