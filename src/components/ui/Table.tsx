import React from 'react';
import { cn } from '../../lib/utils';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  className?: string;
  onRowClick?: (item: T) => void;
  rowKey?: (item: T) => string;
}

export function Table<T>({
  columns,
  data,
  loading = false,
  emptyText = '暂无数据',
  className,
  onRowClick,
  rowKey,
}: TableProps<T>) {
  return (
    <div className={cn('w-full overflow-hidden rounded-lg border border-gray-200', className)}>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
                    col.className
                  )}
                  style={{ width: col.width }}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                  加载中...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={rowKey ? rowKey(item) : `row-${index}`}
                  className={cn(
                    'transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-gray-50'
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map(col => (
                    <td
                      key={String(col.key)}
                      className={cn('px-4 py-3 whitespace-nowrap text-sm text-gray-700', col.className)}
                    >
                      {col.render ? col.render(item) : String(item[col.key as keyof T] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
