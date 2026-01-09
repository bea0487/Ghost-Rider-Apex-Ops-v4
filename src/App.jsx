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
import NotFound from './routes/NotFound'

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
        path="/app"
        element={
          <ProtectedRoute>
            <ClientDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
