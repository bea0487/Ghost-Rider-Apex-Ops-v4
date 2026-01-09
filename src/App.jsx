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

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/clients"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/eld-reports"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/csa-scores"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/ifta"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dataq"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/driver-files"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/tickets"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

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

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
