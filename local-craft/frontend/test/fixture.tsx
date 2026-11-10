// Isolated test entry: the checkout is missing src/main.jsx and several unrelated route imports.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../src/context/AuthContext';
import WorkshopDetailPage from '../src/pages/public/WorkshopDetailPage';
import WorkshopFormPage from '../src/pages/host/WorkshopFormPage';
import type { User } from '../src/types/user.type';

const params = new URLSearchParams(window.location.search);
const user: User = { _id: '000000000000000000000001', fullName: 'Khách kiểm thử', email: 'fixture@example.com', role: params.has('host') ? 'HOST' : 'TOURIST', status: 'ACTIVE', createdAt: '', updatedAt: '' };
const authenticated = params.has('auth') || params.has('host');
createRoot(document.getElementById('root')!).render(
  <AuthContext.Provider value={{ user: authenticated ? user : null, token: authenticated ? 'fixture-token' : null, isAuthenticated: authenticated, loading: false, login: () => {}, logout: () => {} }}>
    <MemoryRouter initialEntries={[params.has('host') ? `/host/workshops/${params.get('id') || 'paid'}/edit` : `/workshops/${params.get('id') || 'paid'}`]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes><Route path="/workshops/:id" element={<WorkshopDetailPage />} /><Route path="/host/workshops/:id/edit" element={<WorkshopFormPage />} /><Route path="/host/workshops" element={<p>Đã lưu workshop</p>} /><Route path="/login" element={<h1>Đăng nhập</h1>} /></Routes>
    </MemoryRouter>
  </AuthContext.Provider>,
);
