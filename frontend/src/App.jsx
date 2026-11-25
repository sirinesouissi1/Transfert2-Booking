import React, { Suspense, lazy } from 'react'; // ✅ AJOUT DE Suspense ET lazy
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './context/authStore';
import { LanguageProvider } from './context/LanguageContext';

// Layout (On les garde en import normal pour un affichage instantané)
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/ScrollToTop';
import PageLoader from './components/PageLoader'; // ✅ AJOUT DU LOADER

// Pages (✅ TRANSFORMÉ EN lazy POUR AFFICHER LE LOADER)
const Home          = lazy(() => import('./pages/Home'));
const Excursions    = lazy(() => import('./pages/Excursions'));
const ExcursionDetail = lazy(() => import('./pages/ExcursionDetail'));
const Transfers     = lazy(() => import('./pages/Transfers'));
const BookingPage   = lazy(() => import('./pages/BookingPage'));
const BookingConfirm = lazy(() => import('./pages/BookingConfirm'));
const Login         = lazy(() => import('./pages/Login'));
const Register      = lazy(() => import('./pages/Register'));
const Dashboard     = lazy(() => import('./pages/Dashboard'));
const NotFound      = lazy(() => import('./pages/NotFound'));
const SelectVehicle = lazy(() => import('./pages/SelectVehicle'));
const BookingDetails = lazy(() => import('./pages/BookingDetails'));
const Confirmation = lazy(() => import('./pages/Confirmation'));

const ExcursionBooking = lazy(() => import('./pages/ExcursionBooking'));
const ExcursionBookingConfirmation = lazy(() => import('./pages/ExcursionBookingConfirmation'));

// Admin (✅ TRANSFORMÉ EN lazy)
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminExcursions = lazy(() => import('./pages/admin/AdminExcursions'));
const AdminClients = lazy(() => import('./pages/admin/AdminClients'));
const AdminVehicules = lazy(() => import('./pages/admin/AdminVehicules'));
const AdminTransferts = lazy(() => import('./pages/admin/AdminTransferts'));
const AdminExcursionBookings = lazy(() => import('./pages/admin/AdminExcursionBookings'));

// Guards
const PrivateRoute = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/admin/login" replace />;
};

const AdminRoute = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  if (!user || user.role !== 'admin') return <Navigate to="/admin/login" replace />;
  return children;
};

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <ScrollToTop />

        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1A1A24', color: '#F8F5EE', border: '1px solid rgba(201,168,76,0.2)' },
            success: { iconTheme: { primary: '#C9A84C', secondary: '#0A0A0F' } },
          }}
        />
        
        {/* ✅ LE SUSPENSE EST AJOUTÉ ICI POUR ENVELOPPER LES ROUTES */}
        <Suspense fallback={<PageLoader />}>
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

            {/* Admin login (public) */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin dashboard (protégé) */}
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
        </Suspense>

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