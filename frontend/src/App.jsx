import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './context/authStore';
import { LanguageProvider } from './context/LanguageContext'; // Import the LanguageProvider

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home          from './pages/Home';
import Excursions    from './pages/Excursions';
import ExcursionDetail from './pages/ExcursionDetail';
import Transfers     from './pages/Transfers';
import BookingPage   from './pages/BookingPage';
import BookingConfirm from './pages/BookingConfirm';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Dashboard     from './pages/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings  from './pages/admin/AdminBookings';
import AdminExcursions from './pages/admin/AdminExcursions';
import NotFound      from './pages/NotFound';
import SelectVehicle from './pages/SelectVehicle';
import BookingDetails from './pages/BookingDetails';
import Confirmation from './pages/Confirmation';

import ExcursionBooking from './pages/ExcursionBooking';
import ExcursionBookingConfirmation from './pages/ExcursionBookingConfirmation';


import AdminLayout from './pages/admin/AdminLayout';
import AdminClients from './pages/admin/AdminClients';
import AdminVehicules from './pages/admin/AdminVehicules';
import AdminTransferts from './pages/admin/AdminTransferts';
import AdminExcursionBookings from './pages/admin/AdminExcursionBookings';

// Guards
const PrivateRoute = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <LanguageProvider> {/* Wrap everything with LanguageProvider */}
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1A1A24', color: '#F8F5EE', border: '1px solid rgba(201,168,76,0.2)' },
            success: { iconTheme: { primary: '#C9A84C', secondary: '#0A0A0F' } },
          }}
        />
        <Routes>
          {/* Public with layout */}
          <Route path="/" element={<WithLayout><Home /></WithLayout>} />
          <Route path="/excursions" element={<WithLayout><Excursions /></WithLayout>} />
          <Route path="/excursions/:id" element={<WithLayout><ExcursionDetail /></WithLayout>} />
          <Route path="/transferts" element={<WithLayout><Transfers /></WithLayout>} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/transferts/vehicules" element={<SelectVehicle />} />
          <Route path="/transferts/details" element={<BookingDetails />} />
          <Route path="/confirmation" element={<Confirmation />} /> 

          <Route path="/excursions/book/:id" element={<ExcursionBooking />} />
          <Route path="/excursions/booking-confirmation/:id" element={<ExcursionBookingConfirmation />} />
          
          {/* Private */}
          <Route path="/booking/:type/:id" element={<PrivateRoute><WithLayout><BookingPage /></WithLayout></PrivateRoute>} />
          <Route path="/booking/confirm/:id" element={<PrivateRoute><WithLayout><BookingConfirm /></WithLayout></PrivateRoute>} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />   
              </PrivateRoute>
            }
          />
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="vehicules" element={<AdminVehicules />} />
            <Route path="excursions" element={<AdminExcursions />} />
            <Route path="reservations/transferts" element={<AdminTransferts />} />
            <Route path="reservations/excursions" element={<AdminExcursionBookings />} />
          </Route>
          <Route path="*" element={<WithLayout><NotFound /></WithLayout>} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

function WithLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}