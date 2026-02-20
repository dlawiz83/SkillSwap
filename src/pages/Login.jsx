import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

export default function Login() {
  const [mode, setMode] = useState("login"); // 'login', 'signup', or 'reset'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // For success messages

  const { login, signup, resetPassword } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
        navigate("/");
      } else if (mode === "signup") {
        await signup(email, password, name);
        navigate("/");
      } else if (mode === "reset") {
        await resetPassword(email);
        setMessage("Check your inbox for further instructions.");
      }
    } catch (err) {
      console.error(err);
      setError(
        mode === "reset"
          ? "Failed to reset password. Check your email address."
          : "Failed to authenticate. Check your details.",
      );
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md p-8 border border-slate-200 rounded-xl shadow-sm bg-white animate-in fade-in duration-300">
        {/* Header Logic */}
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
          {mode === "login" && "Welcome back"}
          {mode === "signup" && "Join the economy"}
          {mode === "reset" && "Reset Password"}
        </h2>
        <p className="text-slate-500 mb-6 text-sm">
          {mode === "login" && "Login to access your matches."}
          {mode === "signup" && "Start swapping skills today."}
          {mode === "reset" && "Enter your email to receive a reset link."}
        </p>

        {/* Error Block */}
        {error && (
          <div className="p-3 mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 animate-in slide-in-from-top-1">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Block */}
        {message && (
          <div className="p-3 mb-6 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md flex items-center gap-2 animate-in slide-in-from-top-1">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {mode !== "reset" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("reset");
                      setError("");
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full flex justify-center items-center py-2.5 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : mode === "login" ? (
              "Sign In"
            ) : mode === "signup" ? (
              "Create Account"
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          {mode === "reset" ? (
            <button
              onClick={() => {
                setMode("login");
                setError("");
                setMessage("");
              }}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center justify-center gap-2 mx-auto"
            >
              <ArrowLeft size={14} /> Back to Login
            </button>
          ) : (
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
              }}
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              {mode === "login"
                ? "Need an account? Sign up"
                : "Already have an account? Login"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
