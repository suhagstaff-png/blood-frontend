// App.jsx
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";

import Footer from "./Component/Footer/Footer";
import Navbar from "./Component/Navbar/Navbar";

import About from "./pages/About";
import ContactUsPage from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import LoginPage from "./pages/Login";
import ProfilePage from "./pages/Profile";
import ReviewForm from "./pages/ReviewForm";
import SearchDonorPage from "./pages/SearchDonorPage";

import AdminDashboard from "./Component/Admin/AdminDashboard";
import AdminDonors from "./Component/Admin/AdminDonors";
import AdminLogin from "./Component/Admin/AdminLogin";
import AdminRequests from "./Component/Admin/AdminRequests";
import AdminSettings from "./Component/Admin/AdminSettings";
import AdminUsers from "./Component/Admin/AdminUsers";
import EmailVerification from "./Component/SingUp/EmailVerification";
import EmailVerificationSent from "./Component/SingUp/EmailVerificationSent";
import SignupPage2 from "./Component/SingUp/SignUp2";
import SignupPage1 from "./Component/SingUp/SingUp1";

/**
 * Helper: simple auth check (reads token from localStorage)
 */
const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return Boolean(token);
};

/**
 * Admin auth check
 */
const isAdminAuthenticated = () => {
  const adminToken = localStorage.getItem("adminToken");
  return Boolean(adminToken);
};

/**
 * ProtectedRoute for regular users
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  if (isAuthenticated()) {
    return children;
  }
  return <Navigate to="/login" replace state={{ from: location }} />;
};

/**
 * AdminRoute for admin users
 */
const AdminRoute = ({ children }) => {
  const location = useLocation();
  if (isAdminAuthenticated()) {
    return children;
  }
  return <Navigate to="/admin" replace state={{ from: location }} />;
};

/**
 * GuestRoute for non-authenticated users
 */
const GuestRoute = ({ children }) => {
  if (!isAuthenticated()) return children;
  return <Navigate to="/dashboard" replace />;
};

/**
 * Layout component for public routes (with navbar and footer)
 */
const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

/**
 * Layout component for admin routes (without navbar and footer)
 */
const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>{children}</main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes with Navbar & Footer */}
        <Route
          path="/*"
          element={
            <PublicLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/searchdonor" element={<SearchDonorPage />} />
                <Route path="/contact" element={<ContactUsPage />} />
                <Route
                  path="/verify-email/:token"
                  element={<EmailVerification />}
                />
                <Route
                  path="/email-verification-sent"
                  element={<EmailVerificationSent />}
                />

                {/* Auth pages */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<SignupPage1 />} />

                {/* Protected routes */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/signup-location" element={<SignupPage2 />} />
                <Route
                  path="/review"
                  element={
                    <ProtectedRoute>
                      <ReviewForm />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </PublicLayout>
          }
        />

        {/* Admin Routes without Navbar & Footer */}
        <Route
          path="/admin/*"
          element={
            <AdminLayout>
              <Routes>
                <Route path="/" element={<AdminLogin />} />
                <Route
                  path="/dashboard"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <AdminRoute>
                      <AdminUsers />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/donors"
                  element={
                    <AdminRoute>
                      <AdminDonors />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/requests"
                  element={
                    <AdminRoute>
                      <AdminRequests />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <AdminRoute>
                      <AdminSettings />
                    </AdminRoute>
                  }
                />
              </Routes>
            </AdminLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
