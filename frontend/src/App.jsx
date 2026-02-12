import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import FarmerDashboard from './FarmerDashboard';
import CreateListing from './CreateListing';
import BuyerDashboard from './BuyerDashboard';
import AIDemo from './AIDemo';
import PriceAnalytics from './PriceAnalytics';
import Finance from './Finance';
import Logistics from './Logistics';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/farmer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['FARMER']}>
                  <FarmerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/farmer/create-listing"
              element={
                <ProtectedRoute allowedRoles={['FARMER']}>
                  <CreateListing />
                </ProtectedRoute>
              }
            />

            <Route
              path="/buyer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['BUYER']}>
                  <BuyerDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/ai-demo" element={<AIDemo />} />
            <Route path="/price-analytics" element={<PriceAnalytics />} />

            <Route
              path="/finance"
              element={
                <ProtectedRoute allowedRoles={['FARMER', 'BUYER']}>
                  <Finance />
                </ProtectedRoute>
              }
            />

            <Route
              path="/logistics"
              element={
                <ProtectedRoute allowedRoles={['FARMER', 'BUYER']}>
                  <Logistics />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
