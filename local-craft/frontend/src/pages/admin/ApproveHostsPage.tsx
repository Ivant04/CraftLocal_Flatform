import React from 'react';
import { users } from '../../utils/mockData';
import Button from '../../components/common/Button';

const ApproveHostsPage: React.FC = () => {
  const pendingHosts = users.filter((u) => u.role === 'HOST' && u.status === 'PENDING');

  return (
    <div className="space-y-6">
      <h1 className="font-headline-lg text-headline-md text-deep-earth">Duyệt Chủ xưởng</h1>
      {pendingHosts.length === 0 ? (
        <div className="bg-white rounded-xl border border-soft-clay p-8 text-center text-on-surface-variant">Không có Chủ xưởng nào chờ duyệt.</div>
      ) : (
        <div className="space-y-4">
          {pendingHosts.map((h) => (
            <div key={h._id} className="bg-white rounded-xl border border-soft-clay p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-on-surface">{h.fullName}</p>
                <p className="text-sm text-on-surface-variant">{h.email} · {h.phone}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm">Duyệt</Button>
                <Button size="sm" variant="outline">Từ chối</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApproveHostsPage;
