import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
  getRowClassName?: (row: TData) => string;
  compact?: boolean;
}

export function DataTable<TData>({
  data,
  columns,
  emptyMessage = 'Tidak ada data tersedia.',
  onRowClick,
  getRowClassName,
  compact = false,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const cellPad = compact ? 'px-4 py-2.5' : 'px-4 py-3';

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="border-b border-[#dee2e6] bg-[#f8f9fa] text-xs font-semibold uppercase text-[#495057]"
            >
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    className={`${cellPad} whitespace-nowrap ${
                      canSort ? 'cursor-pointer select-none hover:bg-[#e9ecef]/60' : ''
                    }`}
                  >
                    <div className="inline-flex items-center gap-1.5">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort &&
                        (sorted === 'asc' ? (
                          <ArrowUp className="h-3.5 w-3.5 text-[#0d6efd]" />
                        ) : sorted === 'desc' ? (
                          <ArrowDown className="h-3.5 w-3.5 text-[#0d6efd]" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-[#adb5bd]" />
                        ))}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-[#dee2e6] bg-white">
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-[#6c757d]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => {
              const extraClass = getRowClassName ? getRowClassName(row.original) : '';
              return (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={`transition-colors hover:bg-[#f8f9fa] ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${extraClass}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={cellPad}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

