import React from 'react';

export function Table({
  columns = [],
  data = [],
  keyField = 'id',
  onRowClick,
  emptyMessage = 'No records found'
}) {
  return (
    <div className="cms-table-container">
      <table className="cms-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} style={col.width ? { width: col.width } : undefined}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '32px', color: 'var(--cms-text-muted)' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row[keyField] || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                style={onRowClick ? { cursor: 'pointer' } : undefined}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx}>
                    {col.render ? col.render(row[col.accessor], row, rowIdx) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
