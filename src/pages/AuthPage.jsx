import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig";
import { motion } from "framer-motion";

export default function AuthPage() {
  const [isNewUser, setIsNewUser] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) return setError("Please enter your email.");

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setError("Password reset email sent!");
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isNewUser) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password.trim()
        );
        await updateProfile(userCredential.user, {
          displayName: name.trim(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      }

      setName("");
      setEmail("");
      setPassword("");
      navigate("/Home");
    } catch (err) {
      let message;
      switch (err.code) {
        case "auth/user-not-found":
          message = "User not found. Please check your email or sign up.";
          break;
        case "auth/wrong-password":
        case "auth/invalid-email":
          message = "Invalid email or password.";
          break;
        case "auth/email-already-in-use":
          message = "Email already in use. Try logging in.";
          break;
        case "auth/weak-password":
          message = "Password too weak. Use at least 6 characters.";
          break;
        default:
          message = "Something went wrong. Please try again.";
      }
      setError(message);
    }

    setLoading(false);
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center px-6 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.form
        onSubmit={resetMode ? handleResetPassword : handleSubmit}
        className="w-full max-w-md bg-white bg-opacity-20 backdrop-blur-md rounded-xl p-8 shadow-xl text-white"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-center">
          {resetMode
            ? "Reset Password"
            : isNewUser
            ? "Create Account"
            : "Welcome Back"}
        </h2>

        {isNewUser && !resetMode && (
          <input
            type="text"
            placeholder="Your Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded-lg bg-white bg-opacity-90 text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        )}

        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-lg bg-white bg-opacity-90 text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        {!resetMode && (
          <>
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-4 px-4 py-3 rounded-lg bg-white bg-opacity-90 text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p
              onClick={() => setResetMode(true)}
              className="text-sm text-blue-300 hover:underline text-right mb-4 cursor-pointer"
            >
              Forgot Password?
            </p>
          </>
        )}

        {resetMode && (
          <p
            className="text-sm text-gray-300 hover:underline mb-4 text-right cursor-pointer"
            onClick={() => setResetMode(false)}
          >
            Back to Login
          </p>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-full shadow-md transition-colors"
        >
          {loading ? "Processing..." : "Continue"}
        </motion.button>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mt-4 text-center ${
              error.includes("sent") ? "text-green-400" : "text-red-400"
            }`}
          >
            {error}
          </motion.p>
        )}

        {!resetMode && (
          <p
            className="text-sm text-center mt-6 text-blue-200 hover:underline cursor-pointer"
            onClick={() => setIsNewUser(!isNewUser)}
          >
            {isNewUser
              ? "Already have an account? Log In"
              : "New here? Create an account"}
          </p>
        )}
      </motion.form>
    </motion.div>
  );
}
