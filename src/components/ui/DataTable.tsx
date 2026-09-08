import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Pagination } from './Pagination';
import { LoadingSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  id: string;
  header: string;
  accessor?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  // Pagination
  pageSize?: number;
  showPagination?: boolean;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isLoading = false,
  emptyTitle = 'Nema podataka',
  emptyDescription = 'Trenutno nema unosa koji odgovaraju traženim kriterijima.',
  emptyActionLabel,
  onEmptyAction,
  pageSize = 15,
  showPagination = true,
  className = '',
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (colId: string) => {
    if (sortColumn === colId) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(colId);
      setSortDirection('asc');
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
        <LoadingSkeleton rows={itemsPerPage > 10 ? 8 : itemsPerPage} columns={columns.length} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
        className={className}
      />
    );
  }

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = showPagination
    ? data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : data;

  return (
    <div
      className={`rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              {columns.map((col) => {
                const isSorted = sortColumn === col.id;
                const alignClass =
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left';

                return (
                  <th
                    key={col.id}
                    style={{ width: col.width }}
                    className={`px-3.5 py-2.5 ${alignClass} ${
                      col.sortable ? 'cursor-pointer select-none hover:bg-slate-100/80' : ''
                    } ${col.className || ''}`}
                    onClick={() => col.sortable && handleSort(col.id)}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right' ? 'justify-end w-full' : ''
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-slate-400">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <ArrowDown className="h-3 w-3 text-emerald-600" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-40 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans text-slate-700">
            {paginatedData.map((item, index) => {
              return (
                <tr
                  key={keyExtractor(item, index)}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-slate-50/90' : 'hover:bg-slate-50/50'
                  }`}
                >
                  {columns.map((col) => {
                    const alignClass =
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left';

                    return (
                      <td
                        key={col.id}
                        className={`px-3.5 py-2.5 ${alignClass} ${col.className || ''}`}
                      >
                        {col.accessor ? col.accessor(item) : (item as any)[col.id]}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showPagination && data.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={data.length}
          pageSize={itemsPerPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
        />
      )}
    </div>
  );
}
