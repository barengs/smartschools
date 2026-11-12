interface PaginationBarProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function PaginationBar({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
}: PaginationBarProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(totalItems, currentPage * pageSize);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-600">
      <div>
        Menampilkan <span className="font-bold text-slate-900">{start}–{end}</span> dari{' '}
        <span className="font-bold text-slate-900">{totalItems}</span> data terdaftar
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-lg border border-slate-200 px-2.5 py-1 font-semibold hover:bg-slate-50 disabled:opacity-45 cursor-pointer"
        >
          Sebelumnya
        </button>
        {Array.from({ length: totalPages }).map((_, idx) => {
          const p = idx + 1;
          const active = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`h-7 min-w-7 rounded-lg px-2 font-bold tabular-nums cursor-pointer ${
                active
                  ? 'bg-[#163b8c] text-white'
                  : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          );
        })}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-lg border border-slate-200 px-2.5 py-1 font-semibold hover:bg-slate-50 disabled:opacity-45 cursor-pointer"
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
}

