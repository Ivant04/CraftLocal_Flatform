import React from 'react';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
}

interface RecentTableProps<T> {
  data: T[];
  columns: Column<T>[];
}

function RecentTable<T extends { _id?: string }>({ data, columns }: RecentTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#EAD8CC]">
            {columns.map((col) => (
              <th key={col.key} className="pb-3 text-left font-semibold text-[#7A6255] text-xs uppercase tracking-wider">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr key={(item as Record<string, unknown>)._id as string || i} className="border-b border-[#EAD8CC]/50 hover:bg-[#FAF7F2] transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="py-3.5 text-[#3D2B1F]">{col.render(item)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecentTable;
