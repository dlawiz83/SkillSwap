import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import { useAuth } from "./context/AuthContext";
import Profile from "./pages/Profile";
import FindPeers from "./pages/FindPeers";
import Dojo from "./pages/Dojo";
import Dashboard from "./pages/Dashboard";
import Messages from "./pages/Messages";

// Simple Protected Route Component
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  // While checking auth status, show nothing or a spinner
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes WITH the Navigation Bar */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="find" element={<FindPeers />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="profile" element={<Profile />} />
          <Route path="messages" element={<Messages />} />
        </Route>

        {/* FULL SCREEN Protected Route (NO Navigation Bar) */}
        <Route
          path="/room/:roomId"
          element={
            <ProtectedRoute>
              <Dojo />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
