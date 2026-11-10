import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import WorkshopDetailPage from '../src/pages/public/WorkshopDetailPage';

const id = new URLSearchParams(window.location.search).get('id');
createRoot(document.getElementById('root')!).render(<>
  <div style={{ padding: '10px 20px', background: '#3d2b1f', color: 'white', font: '13px sans-serif' }}>KIỂM THỬ DỮ LIỆU THẬT · CHỈ ĐỌC · Trang workshop chạy riêng do entrypoint ứng dụng đang thiếu</div>
  <MemoryRouter initialEntries={[`/workshops/${id || ''}`]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <Routes><Route path="/workshops/:id" element={<WorkshopDetailPage />} /><Route path="*" element={<p>Thêm ?id=workshopId để kiểm thử</p>} /></Routes>
  </MemoryRouter>
</>);
