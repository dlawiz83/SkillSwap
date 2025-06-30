import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { motion } from "framer-motion";

export default function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/AuthPage");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (!user) return null;

  const displayName = user.displayName || user.email;

  return (
    <motion.div
      className="flex flex-wrap justify-between items-center px-10 py-6 bg-gradient-to-r from-indigo-800 via-purple-800 to-pink-800 text-white shadow-md"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-3xl font-extrabold cursor-pointer tracking-wide"
        onClick={() => navigate("/Home")}
        whileHover={{ scale: 1.05 }}
      >
        SkillSwap
      </motion.h1>

      <div className="flex items-center gap-6 mt-4 sm:mt-0 ml-2">
        

        <motion.button
          onClick={handleSignOut}
          className="bg-orange-500 hover:bg-orange-600 transition-all px-6 py-3 text-lg font-semibold rounded-full shadow-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Sign Out
        </motion.button>
      </div>
    </motion.div>
  );
}
