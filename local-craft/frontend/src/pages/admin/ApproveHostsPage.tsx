import React, { useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';
import type { User } from '../../types/user.type';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const ApproveHostsPage: React.FC = () => {
  const [pendingHosts, setPendingHosts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadPending = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getPendingHosts();
      const list = res.data?.data;
      setPendingHosts(Array.isArray(list) ? list : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không tải được danh sách Chủ xưởng chờ duyệt.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (id: string) => {
    setBusyId(id);
    try {
      await adminApi.approveHost(id);
      setPendingHosts((prev) => prev.filter((h) => h._id !== id));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Phê duyệt thất bại.');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id: string) => {
    setBusyId(id);
    try {
      await adminApi.blockUser(id);
      setPendingHosts((prev) => prev.filter((h) => h._id !== id));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Từ chối thất bại.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-headline-lg text-headline-md text-deep-earth">Duyệt Chủ xưởng</h1>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
      )}
      {loading ? (
        <div className="py-16 flex justify-center"><Loading /></div>
      ) : pendingHosts.length === 0 ? (
        <div className="bg-white rounded-xl border border-soft-clay p-8 text-center text-on-surface-variant">Không có Chủ xưởng nào chờ duyệt.</div>
      ) : (
        <div className="space-y-4">
          {pendingHosts.map((h) => (
            <div key={h._id} className="bg-white rounded-xl border border-soft-clay p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-on-surface">{h.fullName}</p>
                <p className="text-sm text-on-surface-variant">{h.email} {h.phone ? `· ${h.phone}` : ''}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" isLoading={busyId === h._id} onClick={() => handleApprove(h._id)}>Duyệt</Button>
                <Button size="sm" variant="outline" disabled={busyId === h._id} onClick={() => handleReject(h._id)}>Từ chối</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApproveHostsPage;
