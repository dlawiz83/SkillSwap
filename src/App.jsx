import './App.css';
import './index.css';
import Home from './pages/Home';
import SkillForm from './pages/SkillForm';
import Matches from './pages/Matches';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Header from './pages/Header';
import Profile from './pages/Profile';

import { BrowserRouter, Routes, NavLink, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      when: "beforeChildren",
    },
  },
};



function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/' || location.pathname === '/AuthPage';

  return (
     <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white"
    >
      {!hideNavbar && (
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white px-6 py-4 flex justify-between items-center shadow-lg sticky top-0 z-50"
        >
          <Header />
          <div className="flex gap-6">
            {[
              { to: "/Home", label: "Home" },
              { to: "/SkillForm", label: "Offer a Skill" },
              { to: "/Matches", label: "Matches" },
              { to: "/Profile", label: "Profile" },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `text-[18px] font-semibold px-5 py-2 rounded-full transition-all duration-300
                  ${
                    isActive
                      ? "bg-orange-500 shadow-lg shadow-orange-400/50 scale-105"
                      : "bg-white bg-opacity-10 hover:bg-opacity-20"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </motion.nav>
      )}

      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/Home" element={<Home />} />
            <Route path="/AuthPage" element={<AuthPage />} />
            <Route path="/SkillForm" element={<SkillForm />} />
            <Route path="/Matches" element={<Matches />} />
            <Route path="/Profile" element={<Profile />} />
          </Routes>
        </AnimatePresence>
      </div>
  </motion.div>
  );
}

export default function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
