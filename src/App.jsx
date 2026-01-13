import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './routes/Login'
import AuthCallback from './routes/AuthCallback'
import Setup from './routes/Setup'
import AdminDashboard from './routes/AdminDashboard'
import ClientDashboard from './routes/ClientDashboard'
import HomeRedirect from './routes/HomeRedirect'
import MarketingLayout from './marketing/components/MarketingLayout'
import MarketingHome from './marketing/pages/Home'
import MarketingServices from './marketing/pages/Services'
import MarketingTheWingman from './marketing/pages/TheWingman'
import MarketingTheGuardian from './marketing/pages/TheGuardian'
import MarketingApexCommand from './marketing/pages/ApexCommand'
import BootstrapAdmin from './routes/BootstrapAdmin'
import NotFound from './routes/NotFound'

import AdminClients from './routes/admin/AdminClients'
import AdminEldReports from './routes/admin/AdminEldReports'
import AdminCsaScores from './routes/admin/AdminCsaScores'
import AdminIfta from './routes/admin/AdminIfta'
import AdminDataq from './routes/admin/AdminDataq'
import AdminDriverFiles from './routes/admin/AdminDriverFiles'
import AdminTickets from './routes/admin/AdminTickets'
import AdminDashboardHome from './routes/AdminDashboard' // alias if needed

import {
  PortalDashboard,
  PortalELDReports,
  PortalCSAScores,
  PortalIFTATracking,
  PortalDataQDisputes,
  PortalDriverFiles,
  PortalSupportTickets,
  PortalSettings,
} from './portal'

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <MarketingLayout>
            <MarketingHome />
          </MarketingLayout>
        }
      />

      <Route
        path="/Services"
        element={
          <MarketingLayout>
            <MarketingServices />
          </MarketingLayout>
        }
      />

      <Route
        path="/TheWingman"
        element={
          <MarketingLayout>
            <MarketingTheWingman />
          </MarketingLayout>
        }
      />

      <Route
        path="/TheGuardian"
        element={
          <MarketingLayout>
            <MarketingTheGuardian />
          </MarketingLayout>
        }
      />

      <Route
        path="/ApexCommand"
        element={
          <MarketingLayout>
            <MarketingApexCommand />
          </MarketingLayout>
        }
      />

      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/setup" element={<Setup />} />

      {/* Bootstrap admin remains available to any authenticated user (protected), because it's used to bootstrap the first admin */}
      <Route
        path="/bootstrap-admin"
        element={
          <ProtectedRoute>
            <BootstrapAdmin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/portal"
        element={
          <ProtectedRoute>
            <HomeRedirect />
          </ProtectedRoute>
        }
      />

      {/* Admin area: require role === 'admin' client-side (server-side checks remain authoritative) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/clients"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminClients />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/eld-reports"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminEldReports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/csa-scores"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminCsaScores />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/ifta"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminIfta />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dataq"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDataq />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/driver-files"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDriverFiles />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/tickets"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminTickets />
          </ProtectedRoute>
        }
      />

      {/* Client portal routes (protected but not admin-only) */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <PortalDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/app/eld-reports"
        element={
          <ProtectedRoute>
            <PortalELDReports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/app/csa-scores"
        element={
          <ProtectedRoute>
            <PortalCSAScores />
          </ProtectedRoute>
        }
      />

      <Route
        path="/app/ifta"
        element={
          <ProtectedRoute>
            <PortalIFTATracking />
          </ProtectedRoute>
        }
      />

      <Route
        path="/app/dataq"
        element={
          <ProtectedRoute>
            <PortalDataQDisputes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/app/driver-files"
        element={
          <ProtectedRoute>
            <PortalDriverFiles />
          </ProtectedRoute>
        }
      />

      <Route
        path="/app/support"
        element={
          <ProtectedRoute>
            <PortalSupportTickets />
          </ProtectedRoute>
        }
      />

      <Route
        path="/app/settings"
        element={
          <ProtectedRoute>
            <PortalSettings />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}