import React from 'react';
import { StaffRoute } from '../components/ProtectedRoute';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { toast } from 'react-toastify';

/**
 * Admin Dashboard – provides quick access utilities for staff.
 * Includes a QR code that points to the production SmartBite URL.
 * The URL is read from an environment variable (VITE_SMARTBITE_URL) which
 * should be set to the deployed site (e.g. https://smartbite.example.com).
 */
export const AdminDashboard = () => {
  const productionUrl = import.meta.env.VITE_SMARTBITE_URL || '';

  if (!productionUrl) {
    toast.error('Production URL not configured. Set VITE_SMARTBITE_URL in .env');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-slate-900">Admin Dashboard</h1>
      <section className="bg-gray-50 rounded-xl p-6 shadow">
        <QRCodeDisplay url={productionUrl} />
      </section>
    </div>
  );
};

export default AdminDashboard;

