import React from 'react';
import { users } from '../../utils/mockData';
import { ROLE_LABELS, USER_STATUS_LABELS } from '../../utils/constants';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PENDING: 'bg-amber-100 text-amber-700',
  BLOCKED: 'bg-red-100 text-red-700',
};

const ManageUsersPage: React.FC = () => (
  <div className="space-y-6">
    <h1 className="font-headline-lg text-headline-md text-deep-earth">Quản lý người dùng</h1>
    <div className="bg-white rounded-xl border border-soft-clay overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-soft-clay bg-soft-clay/30">
          <th className="p-4 text-left font-medium">Tên</th>
          <th className="p-4 text-left font-medium">Email</th>
          <th className="p-4 text-left font-medium">Vai trò</th>
          <th className="p-4 text-left font-medium">Trạng thái</th>
          <th className="p-4 text-left font-medium">Thao tác</th>
        </tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-b border-soft-clay/50">
              <td className="p-4 font-medium">{u.fullName}</td>
              <td className="p-4 text-on-surface-variant">{u.email}</td>
              <td className="p-4"><span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">{ROLE_LABELS[u.role]}</span></td>
              <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[u.status]}`}>{USER_STATUS_LABELS[u.status]}</span></td>
              <td className="p-4">
                {u.status === 'ACTIVE' ? (
                  <button className="text-xs text-error font-semibold hover:underline">Khóa</button>
                ) : u.status === 'BLOCKED' ? (
                  <button className="text-xs text-green-600 font-semibold hover:underline">Mở khóa</button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default ManageUsersPage;
