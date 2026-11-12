import React, { useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';
import type { User } from '../../types/user.type';
import { ROLE_LABELS, USER_STATUS_LABELS } from '../../utils/constants';
import Loading from '../../components/common/Loading';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PENDING: 'bg-amber-100 text-amber-700',
  BLOCKED: 'bg-red-100 text-red-700',
};

const ManageUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminApi
      .getUsers({ limit: 100 })
      .then((res) => {
        if (!active) return;
        const list = res.data?.data?.users ?? res.data?.data ?? [];
        setUsers(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || 'Không tải được danh sách người dùng.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleToggleBlock = async (u: User) => {
    setBusyId(u._id);
    setError('');
    try {
      const res = u.status === 'BLOCKED'
        ? await adminApi.unblockUser(u._id)
        : await adminApi.blockUser(u._id);
      const updated = res.data?.data;
      if (updated) {
        setUsers((prev) => prev.map((item) => (item._id === u._id ? updated : item)));
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Cập nhật trạng thái thất bại.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-headline-lg text-headline-md text-deep-earth">Quản lý người dùng</h1>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
      )}
      {loading ? (
        <div className="py-16 flex justify-center"><Loading /></div>
      ) : (
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
                  <td className="p-4"><span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">{ROLE_LABELS[u.role] || u.role}</span></td>
                  <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[u.status] || ''}`}>{USER_STATUS_LABELS[u.status] || u.status}</span></td>
                  <td className="p-4">
                    {u.role !== 'ADMIN' && (u.status === 'ACTIVE' || u.status === 'BLOCKED') ? (
                      <button
                        type="button"
                        disabled={busyId === u._id}
                        onClick={() => handleToggleBlock(u)}
                        className={`text-xs font-semibold hover:underline cursor-pointer disabled:opacity-50 ${
                          u.status === 'ACTIVE' ? 'text-error' : 'text-green-600'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUsersPage;
