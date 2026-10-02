import React from 'react';

export const Table = ({
  columns = [],
  data = [],
  keyField = 'id',
  onRowClick,
  emptyMessage = 'No records found.',
  className = ''
}) => {
  return (
    <div className={`cms-table-wrapper w-full overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-[#E2E8F0] text-left text-sm">
        <thead className="bg-[#F8FAFC]">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                scope="col"
                className={`px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0] bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-[#64748B]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row[keyField] || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-slate-50' : 'hover:bg-slate-50/50'}`}
              >
                {columns.map((col, colIdx) => (
                  <td key={col.key || colIdx} className={`px-4 py-3.5 whitespace-nowrap text-[#0F172A] ${col.cellClassName || ''}`}>
                    {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
